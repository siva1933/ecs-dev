import { useEffect, useState } from "react";
import _ from "lodash";
import "./App.css";
function App() {
  const [data, setData] = useState([]);
  const [cart, addToCart] = useState({});
  const [openCart, setOpenCart] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecords, setShowRecords] = useState({
    start: 0,
    end: 40,
  });

  const sortDefault = {
    title: false,
    ratings_count: false,
    average_rating: false,
    price: false,
  };

  const [sort, setSort] = useState(sortDefault);

  function callBooks() {
    setLoading(true);
    fetch(
      "https://s3-ap-southeast-1.amazonaws.com/he-public-data/books8f8fe52.json"
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        alert("error", JSON.stringify(err));
        setLoading(false);
      });
  }
  useEffect(() => {
    callBooks();
    let sTop = document.getElementById("sTop");
    function scrollFunc() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setShowRecords((prev) => ({
          start: 0,
          end: prev.end + 40,
        }));
      }

      if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
      ) {
        sTop.style.display = "flex";
      } else {
        sTop.style.display = "none";
      }
    }
    document.addEventListener("scroll", scrollFunc);

    return () => {
      document.removeEventListener("scroll", scrollFunc);
    };
  }, []);

  const sortCall = (key) => {
    setData(
      _.orderBy(
        data,
        [
          function (o) {
            return o[key];
          },
        ],
        [sort[key] ? "asc" : "desc"]
      )
    );

    setSort({
      ...sort,
      [key]: !sort[key],
    });
  };

  return (
    <div className="App">
      <div
        id={"sTop"}
        className="scrollToTop"
        onClick={() => {
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
          setShowRecords({
            start: 0,
            end: 40,
          });
        }}
      >
        <div className="arrow-up"></div>
      </div>
      {loading ? (
        <div>loading...</div>
      ) : (
        <div className="tableWarpper">
          <div className="buttonWrap">
            <button
              onClick={() => {
                if (Object.keys(cart).length > 0) {
                  setOpenCart(!openCart);
                }
              }}
            >
              Cart
              {Object.keys(cart).length > 0
                ? ` (${Object.keys(cart).length})`
                : ""}
            </button>
            {openCart && (
              <div className="cart">
                {Object.keys(cart).length > 0 &&
                  Object.keys(cart).map((item) => {
                    return (
                      <div>
                        <span>{cart[item].bookID}</span>
                        <span>{cart[item].title}</span>
                        <span>Rs. {cart[item].price}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <div className="inputWrapper">
            <input
              placeholder="Search by title,author"
              onChange={(e) => {
                let filteredData = _.filter(
                  data,
                  (item) =>
                    (item.title + "")
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase()) ||
                    (item.authors + "")
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase())
                );
                setFilteredData(filteredData);
                setSort(sortDefault);
                setShowRecords({
                  start: 0,
                  end: filteredData.length >= 40 ? 40 : filteredData.length,
                });
              }}
            />
          </div>
          <div className="w90 mAuto bgWhiteCard">
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => {
                      sortCall("title");
                    }}
                  >
                    Title
                    <div
                      className={
                        sort["title"]
                          ? "arrow-down inlineBlock"
                          : "arrow-up inlineBlock"
                      }
                    ></div>
                  </th>
                  <th className="w20">Authors</th>
                  <th
                    className="w10 center"
                    onClick={() => {
                      sortCall("average_rating");
                    }}
                  >
                    Avg Rating
                    <div
                      className={
                        sort["average_rating"]
                          ? "arrow-down inlineBlock"
                          : "arrow-up inlineBlock"
                      }
                    ></div>
                  </th>
                  <th className="w10 center">Language Code</th>
                  <th
                    className="w10 center"
                    onClick={() => {
                      sortCall("ratings_count");
                    }}
                  >
                    Rating Count
                    <div
                      className={
                        sort["ratings_count"]
                          ? "arrow-down inlineBlock"
                          : "arrow-up inlineBlock"
                      }
                    ></div>
                  </th>
                  <th
                    className="w10 center"
                    onClick={() => {
                      sortCall("price");
                    }}
                  >
                    Price
                    <div
                      className={
                        sort["price"]
                          ? "arrow-down inlineBlock"
                          : "arrow-up inlineBlock"
                      }
                    ></div>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0
                  ? filteredData
                      .slice(showRecords.start, showRecords.end)
                      .map((item) => (
                        <tr key={item.bookID}>
                          <td>
                            {("" + item.title).length > 100
                              ? ("" + item.title).substr(0, 100) + "..."
                              : item.title}
                          </td>
                          <td>{item.authors}</td>
                          <td className="center">
                            <div
                              className="Stars"
                              style={{
                                "--rating": item.average_rating,
                              }}
                            ></div>
                          </td>
                          <td className="center">{item.language_code}</td>
                          <td className="center">{item.ratings_count}</td>
                          <td className="center">Rs. {item.price}</td>
                          <td>
                            <button
                              onClick={() => {
                                addToCart({
                                  ...cart,
                                  [item.bookID]: {
                                    ...item,
                                    quantity: cart[item.bookID]
                                      ? cart[item.bookID].quantity + 1
                                      : 1,
                                  },
                                });
                              }}
                            >
                              Add to Cart
                            </button>
                          </td>
                        </tr>
                      ))
                  : data
                      .slice(showRecords.start, showRecords.end)
                      .map((item) => (
                        <tr key={item.bookID}>
                          <td>
                            {("" + item.title).length > 100
                              ? ("" + item.title).substr(0, 100) + "..."
                              : item.title}
                          </td>
                          <td>{item.authors}</td>
                          <td className="center">
                            <div
                              className="Stars"
                              style={{
                                "--rating": item.average_rating,
                              }}
                            ></div>
                          </td>
                          <td className="center">{item.language_code}</td>
                          <td className="center">{item.ratings_count}</td>
                          <td className="center">Rs. {item.price}</td>
                          <td>
                            <button
                              onClick={() => {
                                addToCart({
                                  ...cart,
                                  [item.bookID]: {
                                    ...item,
                                    quantity: cart[item.bookID]
                                      ? cart[item.bookID].quantity + 1
                                      : 1,
                                  },
                                });
                              }}
                            >
                              Add to Cart
                            </button>
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
