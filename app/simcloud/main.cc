#include <boost/asio/io_context.hpp>
#include <boost/asio/ip/address.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/strand.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <chrono>
#include <iostream>
#include <memory>
#include <string>
#include <thread>
#include <utility>
#include <vector>

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
using net::ip::tcp;

inline void fail(beast::error_code ec, const char *what) {
  if (ec == net::error::operation_aborted) {
    return;
  }
  std::cerr << what << ": " << ec.message() << "\n";
}

template <class Body>
http::message_generator handle_request(http::request<Body> &&request) {
  const auto method_not_allowed = [&request](beast::string_view method) {
    http::response<http::string_body> response{http::status::method_not_allowed,
                                               request.version()};
    response.set(http::field::content_type, "text/html");
    response.keep_alive(request.keep_alive());
    response.body() = "Method Not Allowed\n" + std::string(method) + "\n";
    response.prepare_payload();
    return response;
  };
  const auto not_found = [&request](beast::string_view target) {
    http::response<http::string_body> response{http::status::not_found,
                                               request.version()};
    response.set(http::field::content_type, "text/html");
    response.keep_alive(request.keep_alive());
    response.body() = "Not Found\n" + std::string(target) + "\n";
    response.prepare_payload();
    return response;
  };
  const auto server_error = [&request](beast::string_view what) {
    http::response<http::string_body> response{
        http::status::internal_server_error, request.version()};
    response.set(http::field::content_type, "text/html");
    response.keep_alive(request.keep_alive());
    response.body() = "Internal Server Error\n" + std::string(what) + "\n";
    response.prepare_payload();
    return response;
  };

  if (request.method() != http::verb::get) {
    return method_not_allowed(http::to_string(request.method()));
  }
  if (request.target() != "/") {
    return not_found(request.target());
  }

  std::string path = "index.html";
  beast::error_code ec;
  http::file_body::value_type body;
  body.open(path.c_str(), beast::file_mode::scan, ec);

  if (ec) {
    return server_error(ec.message());
  }

  http::response<http::file_body> response{
      std::piecewise_construct, std::make_tuple(std::move(body)),
      std::make_tuple(http::status::ok, request.version())};
  response.set(http::field::content_type, "text/html");
  response.content_length(body.size());
  response.keep_alive(request.keep_alive());
  return response;
}

class connection : public std::enable_shared_from_this<connection> {
  beast::tcp_stream tcp_stream_;
  beast::flat_buffer flat_buffer_;
  http::request<http::string_body> request_;

public:
  connection(tcp::socket &&socket) : tcp_stream_(std::move(socket)) {}

  void run() {
    net::dispatch(
        tcp_stream_.get_executor(),
        beast::bind_front_handler(&connection::read, shared_from_this()));
  }

  void read() {
    request_ = {};
    tcp_stream_.expires_after(std::chrono::seconds(30));

    http::async_read(
        tcp_stream_, flat_buffer_, request_,
        beast::bind_front_handler(&connection::on_read, shared_from_this()));
  }

  void on_read(beast::error_code ec, size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);

    if (ec == http::error::end_of_stream) {
      close();
      return;
    }

    if (ec) {
      fail(ec, "read");
      return;
    }

    send_response(handle_request(std::move(request_)));
  }

  void send_response(http::message_generator &&msg) {
    bool keep_alive = msg.keep_alive();

    beast::async_write(tcp_stream_, std::move(msg),
                       beast::bind_front_handler(&connection::on_write,
                                                 shared_from_this(),
                                                 keep_alive));
  }

  void on_write(bool keep_alive, beast::error_code ec,
                size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);

    if (ec) {
      fail(ec, "write");
      return;
    }

    if (!keep_alive) {
      close();
      return;
    }

    read();
  }

  void close() {
    beast::error_code ec;
    tcp_stream_.socket().shutdown(tcp::socket::shutdown_send, ec);
  }
};

class server : public std::enable_shared_from_this<server> {
  net::io_context &io_context_;
  tcp::acceptor acceptor_;

public:
  server(net::io_context &io_context, tcp::endpoint endpoint)
      : io_context_(io_context), acceptor_(net::make_strand(io_context)) {
    beast::error_code ec;

    acceptor_.open(endpoint.protocol(), ec);
    if (ec) {
      fail(ec, "open");
      return;
    }

    acceptor_.set_option(net::socket_base::reuse_address(true), ec);
    if (ec) {
      fail(ec, "set_option");
      return;
    }

    acceptor_.bind(endpoint, ec);
    if (ec) {
      fail(ec, "bind");
      return;
    }

    acceptor_.listen(net::socket_base::max_listen_connections, ec);
    if (ec) {
      fail(ec, "listen");
      return;
    }
  }

  void run() { accept(); }

private:
  void accept() {
    acceptor_.async_accept(
        net::make_strand(io_context_),
        beast::bind_front_handler(&server::on_accept, shared_from_this()));
  }

  void on_accept(beast::error_code ec, tcp::socket socket) {
    if (ec) {
      fail(ec, "accept");
      return;
    } else {
      std::make_shared<connection>(std::move(socket))->run();
    }

    // accept next connection
    accept();
  }
};

int main(int argc, char *argv[]) {
  const net::ip::address host = net::ip::make_address("127.0.0.1");
  const unsigned short port = 8000;
  const int threads = static_cast<int>(std::thread::hardware_concurrency());

  net::io_context ioc{threads};

  std::make_shared<server>(ioc, tcp::endpoint{host, port})->run();

  std::vector<std::thread> v;
  v.reserve(threads - 1);
  for (int i = threads - 1; i > 0; --i) {
    v.emplace_back([&ioc] { ioc.run(); });
  }

  ioc.run();

  return EXIT_SUCCESS;
}
