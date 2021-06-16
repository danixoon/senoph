import * as React from "react";
import * as ReactDOM from "react-dom";
import Root from "./Root";

const rootElement = document.getElementById("senoph-root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.render(<Root />, rootElement);
