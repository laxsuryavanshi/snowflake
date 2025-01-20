#ifndef SERVER_HH_
#define SERVER_HH_

#include <boost/asio/io_context.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/core/noncopyable.hpp>
#include <boost/system/error_code.hpp>
#include <memory>
#include <string>

namespace simcloud {

namespace net = boost::asio;
using net::ip::tcp;

class server : public std::enable_shared_from_this<server>,
               private boost::noncopyable {
public:
  server(net::io_context &);

  void listen(net::ip::port_type);

  void listen(const std::string &, net::ip::port_type);

  void listen(const char *, net::ip::port_type);

  void listen(const tcp::endpoint &);

private:
  void listen();

  void accept();

  void on_accept(const boost::system::error_code &, tcp::socket);

  net::io_context &io_context_;
  tcp::acceptor acceptor_;
};

} // namespace simcloud

#endif // SERVER_HH_
