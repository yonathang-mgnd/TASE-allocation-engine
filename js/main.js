import { allocate } from "./allocate.js";

const inputData = {
  tenderId: "abc-123",
  tenderDate: "2022-11-01",
  tenderCoupon: 0.05,
  tenderRedemptionDate: "2024-05-01",
  totalToAllocate: 120,
  bids: [
    { party: "party_a", requested: 40, offer: 200 },
    { party: "party_b", requested: 20, offer: 200 },
    { party: "party_c", requested: 60, offer: 150 },
    { party: "party_d", requested: 20, offer: 150 },
    { party: "party_e", requested: 120, offer: 150 },
    { party: "party_f", requested: 50, offer: 110 },
  ],
};

window.onload = function () {
  const btn = document.getElementById("btn");
  btn.addEventListener("click", makeRequest);
};

// allocate(inputData);
drawTableEl(inputData.bids);

export async function makeRequest() {
  // fetchResults().then((res) => {
  allocate(inputData).then((res) => {
    const tableEl = document.querySelector(".styled-table");
    tableEl.remove();
    drawTableEl(res.allocations);
  });
}
async function fetchResults() {
  const res = await fetch("https://mercury-knotty-bowl.glitch.me/allocate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputData),
  });
  return res.json();
}

function drawTableEl(tableData) {
  const bidArr = tableData;

  const el = document.createElement("table");
  el.classList.add("styled-table");
  el.innerHTML = `
<thead>
  <tr>
    <th>Party</th>
    <th>Requested</th>
    <th>Offer</th>
    <th>Allocated</th>
  </tr>
</thead>
  `;
  const tBodyEl = bidArr.map((bid) => {
    return `
    <tr>
      <td>${bid.party}</td>
      <td>${bid.requested}</td>
      <td>${bid.offer}</td>
      <td>${bid.allocated}</td>
    </tr>
    `;
  });
  el.innerHTML += tBodyEl.join("");
  const resultsEl = document.getElementById("results");
  resultsEl.appendChild(el);
}

// function findEqualBidsArr(allocatedResults) {
//   let startIdx = undefined;
//   let endIdx = allocatedResults.length - 1;
//   for (let i = endIdx; i >= 1; i--) {
//     const { offer } = allocatedResults[i];
//     if (
//       offer === allocatedResults[i - 1]?.offer &&
//       !startIdx &&
//       startIdx !== 0
//     ) {
//       // if the next bid is the same offer
//       startIdx = i - 1;
//       for (let j = i; j < allocatedResults.length; j++) {
//         // loop till end of array to find first differing offer
//         if (offer !== allocatedResults[j]?.offer) {
//           endIdx = j - 1;
//           break;
//         }
//       }
//     }
//   }
//   return { startIdx, endIdx };
// }
