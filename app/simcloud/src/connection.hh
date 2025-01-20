#ifndef CONNECTION_HH_
#define CONNECTION_HH_

#include <boost/asio/ip/tcp.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/core/ignore_unused.hpp>
#include <boost/core/noncopyable.hpp>
#include <boost/system/error_code.hpp>
#include <memory>

namespace simcloud {

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
using net::ip::tcp;

class connection : public std::enable_shared_from_this<connection>,
                   private boost::noncopyable {
public:
  connection(tcp::socket &&);

  void handle();

  void close();

  void read();

  void write(http::message_generator &&);

private:
  void on_read(const boost::system::error_code &, size_t bytes_transferred);

  void on_write(bool keep_alive, const boost::system::error_code &,
                size_t bytes_transferred);

  beast::tcp_stream tcp_stream_;
  beast::flat_buffer flat_buffer_;
  http::request<http::string_body> request_;
};

} // namespace simcloud

#endif // CONNECTION_HH_
