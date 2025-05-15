import React from "react";
import Pagination from "react-bootstrap/Pagination";
import "./Paginations.css";

const Paginations = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== "...") {
      onPageChange(page);
    }
  };

  const getVisiblePageNumbers = () => {
    const pages = [1];

    if (currentPage > 3) pages.push("...");
    if (currentPage > 2) pages.push(currentPage - 1);
    if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
    if (currentPage < totalPages - 1) pages.push(currentPage + 1);
    if (currentPage < totalPages - 2) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const renderPaginationItems = () => {
    return getVisiblePageNumbers().map((page, index) => (
      <Pagination.Item
        key={index}
        active={page === currentPage}
        disabled={page === "..."}
        onClick={() => handlePageClick(page)}
      >
        {page}
      </Pagination.Item>
    ));
  };

  return (
    <Pagination>
      <Pagination.First onClick={() => handlePageClick(1)} disabled={currentPage === 1} />
      <Pagination.Prev onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1} />
      {renderPaginationItems()}
      <Pagination.Next onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages} />
      <Pagination.Last onClick={() => handlePageClick(totalPages)} disabled={currentPage === totalPages} />
    </Pagination>
  );
};

export default Paginations;