// import { createRoot } from 'react-dom/client';

// function NavigationBar() {
//   // TODO: Actually implement a navigation bar
//   return <h1>Hello from React! change</h1>;
// }

// const domNode = document.getElementById('navigation');
// const root = createRoot(domNode);
// root.render(<NavigationBar />);

import React from "react";

function App() {
  return (
    <div>
      <h1>Video Recording App</h1>

      <button id="recordButton">Start Recording</button>
      <p id="prompt"></p>

      <script src="/js/main.js"></script>
    </div>
  );
}
export default App;
