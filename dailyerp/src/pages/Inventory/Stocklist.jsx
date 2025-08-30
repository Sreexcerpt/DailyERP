import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";



function StockListERP() {
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const [Categories, setCategories] = useState([]);
  const filtered = stock.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase()) || item.materialId.toLowerCase().includes(search.toLowerCase());
    console.log("matchesSearch", category);
    const matchesCategory = category ? item.categoryId?._id === category : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/category', {
          params: { companyId }
        });
        setCategories(response.data);
        console.log("Categories fetched:", response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();

    const fetchData = async () => {
      try {
        console.log("Fetching stock for companyId:", companyId, "and financialYear:", financialYear);
        const response = await axios.get("http://localhost:8080/api/stock/data", {
          params: { companyId, financialYear }
        });
        console.log("Stock data fetched:", response.data);
        setStock(response.data);
        console.log("Stock data fetched:", response.data);
      } catch (error) {
        console.error("Failed to fetch stock:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="content">
      <h3 className="mb-3">Stock Inventory</h3>

      {/* Filters */}
      <div className="row mb-4 ">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by Description or Material No"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {Categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.categoryName}
              </option>
            ))} 
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm align-middle">
          <thead className="table-primary text-center">
            <tr>
              <th>#</th>
              <th>Material No</th>
              <th>Description</th>
              <th>Category</th>
              <th>UOM</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Location</th>
              <th>Lot Number</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">No stock found.</td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{item.materialId || item.matno}</td>
                  <td>{item.description || item.matdesc}</td>
                  <td>{item.categoryId?.categoryName}</td>
                  <td className="text-center">{item.baseUnit || item.uom}</td>
                  <td className="text-end">{item.quantityAvailable ?? item.quantity}</td>
                  <td className="text-center">
                    <span
                      className={`badge ${(item.status ||
                        (item.quantityAvailable ?? item.quantity) > 10
                        ? "In Stock"
                        : (item.quantityAvailable ?? item.quantity) > 0
                          ? "Low Stock"
                          : "Out of Stock") === "In Stock"
                        ? "bg-success"
                        : (item.status ||
                          (item.quantityAvailable ?? item.quantity) > 0
                          ? "Low Stock"
                          : "Out of Stock") === "Low Stock"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                        }`}
                    >
                      {item.status ||
                        ((item.quantityAvailable ?? item.quantity) > 10
                          ? "In Stock"
                          : (item.quantityAvailable ?? item.quantity) > 0
                            ? "Low Stock"
                            : "Out of Stock")}
                    </span>
                  </td>
                  <td>{item.location || "-"}</td>
                  <td>{item.lotNumber || "-"}</td>
                  <td>
                    {item.updatedAt
                      ? new Date(item.updatedAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockListERP;
