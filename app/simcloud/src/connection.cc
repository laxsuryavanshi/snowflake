#include <boost/throw_exception.hpp>
#include <chrono>
#include <spdlog/spdlog.h>

#include "connection.hh"

namespace simcloud {

namespace beast = boost::beast;

connection::connection(tcp::socket &&socket) : tcp_stream_(std::move(socket)) {}

void connection::handle() {
  net::dispatch(
      tcp_stream_.get_executor(),
      beast::bind_front_handler(&connection::read, shared_from_this()));
}

void connection::close() {
  tcp_stream_.socket().shutdown(tcp::socket::shutdown_send);
  spdlog::debug("CONNECTION closed");
}

void connection::read() {
  request_ = {};
  tcp_stream_.expires_after(std::chrono::seconds(30));

  http::async_read(
      tcp_stream_, flat_buffer_, request_,
      beast::bind_front_handler(&connection::on_read, shared_from_this()));
}

void connection::write(http::message_generator &&msg) {
  bool keep_alive = msg.keep_alive();

  beast::async_write(tcp_stream_, std::move(msg),
                     beast::bind_front_handler(&connection::on_write,
                                               shared_from_this(), keep_alive));
}

void connection::on_read(const boost::system::error_code &error,
                         size_t bytes_transferred) {
  boost::ignore_unused(bytes_transferred);

  if (error == http::error::end_of_stream) {
    return close();
  }

  if (error) {
    boost::system::system_error err(error, "on_read");
    boost::throw_exception(err, BOOST_CURRENT_LOCATION);
  }

  // write(handle_request(request_));
}

void connection::on_write(bool keep_alive,
                          const boost::system::error_code &error,
                          size_t bytes_transferred) {
  boost::ignore_unused(bytes_transferred);

  if (error) {
    boost::system::system_error err(error, "on_write");
    boost::throw_exception(err, BOOST_CURRENT_LOCATION);
  }

  if (!keep_alive) {
    return close();
  }

  read();
}

} // namespace simcloud
