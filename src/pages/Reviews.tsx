import { useState } from "react";

export default function Reviews() {
  const [count] = useState(0);

  return (
    <div style={{ padding: 40 }}>
      <h1>Reviews Page Working</h1>
      <p>{count}</p>
    </div>
  );
}
