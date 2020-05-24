import React, { useState, useEffect } from "react";
import {
  length,
  path,
  merge,
  map,
  isEmpty,
  keys,
  includes,
  dissoc,
  difference,
} from "ramda";
import socketIOClient from "socket.io-client";
import {
  Container,
  Header,
  Dropdown,
  Button,
  Segment,
  Accordion,
} from "semantic-ui-react";

const symbolsOptions = [
  { key: "V", value: "V", flag: "us", text: "Visa" },
  { key: "NKE", value: "NKE", flag: "us", text: "Nike" },
  { key: "AAPL", value: "AAPL", flag: "us", text: "Apple" },
  { key: "PGR", value: "PGR", flag: "us", text: "Progressive Corp" },
  { key: "NVDA", value: "NVDA", flag: "us", text: "NVDA" },
  { key: "MCD", value: "MCD", flag: "us", text: "McDonald's" },
  { key: "MSFT", value: "MSFT", flag: "us", text: "Microsoft" },
  { key: "WMT", value: "WMT", flag: "us", text: "Walmart" },
];

const App = () => {
  const [data, setData] = useState({});
  const [symbols, setSymbols] = useState([]);
  const [activeAccordion, setAcctiveAccordion] = useState([]);
  const [endpoint] = useState("http://127.0.0.1:4001");
  const [socket, setSocket] = useState({ on: () => {} });

  const handleSearch = () => {
    socket.emit("data", symbols);
  };
  const handleChange = (event, { value }) => {
    if (length(keys(data)) > length(value)) {
      const removedSymbol = path([0], difference(keys(data), value));
      setSymbols(value);
      setData(dissoc(removedSymbol, data));
    } else setSymbols(value);
  };
  const handleClick = (index) => {
    if (includes(index, activeAccordion))
      setAcctiveAccordion(activeAccordion.filter((i) => i !== index));
    else setAcctiveAccordion([...activeAccordion, index]);
  };

  useEffect(() => {
    setSocket(socketIOClient(endpoint));
  }, [endpoint]);

  useEffect(() => {
    socket.on("FromAPI", async ({ response, symbol, messages }) => {
      if (path(["status", response])) {
        const company = path(["symbol"], symbol);
        await setData(
          merge(data, {
            [company]: {
              symbol,
              messages,
            },
          })
        );
      }
    });
  });

  return (
    <Container style={{ textAlign: "center", padding: "20px" }}>
      <Header>Frontend Engineer Challenge</Header>
      <Segment>
        <Dropdown
          placeholder="Select Symbol"
          multiple
          floating
          search
          selection
          options={symbolsOptions}
          onChange={handleChange}
        />
        <Button
          style={{ margin: "0px 1px" }}
          primary
          onClick={handleSearch}
          disabled={!length(symbols)}
        >
          Search
        </Button>
      </Segment>
      {!isEmpty(data) && (
        <Segment>
          {keys(data).map((key, index) => {
            return (
              <Segment>
                <Accordion>
                  <Accordion.Title
                    active={includes(index, activeAccordion)}
                    index={index}
                    onClick={() => handleClick(index)}
                    style={{ fontWeight: "bold" }}
                  >
                    {`${data[key].symbol.title}  (click here to see messages)`}
                  </Accordion.Title>
                  <Accordion.Content active={includes(index, activeAccordion)}>
                    {map((message) => {
                      return <Segment>{message.body}</Segment>;
                    }, data[key].messages)}
                  </Accordion.Content>
                </Accordion>
              </Segment>
            );
          })}
        </Segment>
      )}
    </Container>
  );
};
export default App;
