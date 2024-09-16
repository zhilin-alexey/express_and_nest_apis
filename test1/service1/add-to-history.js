async function addToHistory({ action, leftoverId, shopId, productId, amount }) {
  const response = await fetch(process.env.SERVICE2_URL + "/history/add", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action,
      leftoverId,
      shopId,
      productId,
      amount
    })
  });
  if (!response.ok) {
    throw new Error(`Failed to add to history: ${await response.text()}`);
  }
}

export default addToHistory;
