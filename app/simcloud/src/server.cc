#include <boost/asio/strand.hpp>
#include <boost/assert/source_location.hpp>
#include <boost/beast/core.hpp>
#include <boost/throw_exception.hpp>
#include <spdlog/spdlog.h>

#include "connection.hh"
#include "server.hh"

namespace simcloud {

namespace beast = boost::beast;

server::server(net::io_context &io_context)
    : io_context_(io_context), acceptor_(net::make_strand(io_context)) {}

void server::listen(net::ip::port_type port) {
  listen(net::ip::address_v4::loopback().to_string(), port);
}

void server::listen(const std::string &host, net::ip::port_type port) {
  listen(host.c_str(), port);
}

void server::listen(const char *host, net::ip::port_type port) {
  const net::ip::address addr = net::ip::make_address(host);
  tcp::endpoint endpoint{addr, port};

  listen(endpoint);
}

void server::listen(const tcp::endpoint &endpoint) {
  acceptor_.open(endpoint.protocol());
  acceptor_.set_option(net::socket_base::reuse_address(true));
  acceptor_.bind(endpoint);

  listen();
}

void server::listen() {
  acceptor_.listen(net::socket_base::max_listen_connections);
  spdlog::debug("SERVER listening on {}:{}",
                acceptor_.local_endpoint().address().to_string(),
                acceptor_.local_endpoint().port());

  accept();
}

void server::accept() {
  acceptor_.async_accept(
      net::make_strand(io_context_),
      beast::bind_front_handler(&server::on_accept, shared_from_this()));
}

void server::on_accept(const boost::system::error_code &error,
                       tcp::socket socket) {
  if (error) {
    boost::system::system_error err(error, "on_accept");
    boost::throw_exception(err, BOOST_CURRENT_LOCATION);
  }
  spdlog::debug("SERVER new http connection");
  std::make_shared<connection>(std::move(socket))->handle();

  /// accept new connection
  accept();
}

} // namespace simcloud
