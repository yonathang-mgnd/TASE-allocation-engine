function allocate(input) {
  const sortedBids = input.bids.sort((a, b) => b.offer - a.offer);

  // console.log('**************** INPUT SORTED ****************')
  // console.table(input.bids);

  let bidsArr = [];
  let smallestBid = sortedBids[0].offer;
  let leftToAllocate = input.totalToAllocate;
  let totalAllocated = 0;

  //** 1.loop through the bids and provision according to their request starting from the highest offer

  for (let i = 0; i < sortedBids.length; i++) {
    const bid = sortedBids[i];
    const { requested, offer } = bid;
    // if there are still funds to allocate
    if (leftToAllocate > 0) {
      smallestBid = offer;

      // if the requested amount is less than the funds left to allocate - allocate the full amount
      if (requested <= leftToAllocate) {
        bidsArr.push({ ...bid, allocated: requested });
        leftToAllocate -= requested;
        totalAllocated += requested;
      } else {
        // if the requested amount is more than the funds left to allocate - allocate the remaining provision
        bidsArr.push({ ...bid, allocated: leftToAllocate });
        totalAllocated += leftToAllocate;
        leftToAllocate = 0;
      }
    } else {
      // if there are no more left to allocate - allocate 0
      bidsArr.push({ ...bid, allocated: 0 });
    }
  }

  // 2. Find bidders equal to the lowest bidder, if any, and allocate to the
  // so that all they all get provisioned proportionally to their requested amount

  // find the slice of the array with the lowest set of equal offers.
  // Return the start and end index of that slice
  // if not found return startIdx as undefined
  let { startIdx, endIdx } = findEqualBidsArr(bidsArr);
  console.log(
    "**************** Equal Bids Slice (to re-allocate proportionally) ****************"
  );
  console.log("startIdx", startIdx);
  console.log("endIdx", endIdx);

  if (startIdx !== undefined) {
    const nonAllocatedEqualBids = bidsArr.slice(startIdx, endIdx + 1);
    console.log("**************** nonAllocatedEqualBids ****************");
    console.table(nonAllocatedEqualBids);

    // re-allocate to the equal bids proportionally to the amount they requested
    const allocatedEqualBids = allocateToEqualBidders(nonAllocatedEqualBids);
    console.log("**************** AllocatedEqualBids ****************");
    console.table(allocatedEqualBids);

    bidsArr.splice(startIdx, allocatedEqualBids.length, ...allocatedEqualBids);
  }

  const returnedVal = {
    tenderId: input.tenderId,
    tenderDate: input.tenderDate,
    tenderCoupon: input.tenderCoupon,
    tenderRedemptionDate: input.tenderRedemptionDate,
    allocations: bidsArr,
    totalAllocated: totalAllocated,
    acceptedBid: smallestBid,
  };

  console.log("**************** RESULT ****************");
  console.log("Results:", returnedVal);
  console.table(bidsArr);
  return Promise.resolve(returnedVal);

  function findEqualBidsArr(allocatedResults) {
    let startIdx = 0;
    let endIdx = undefined;
    for (let i = allocatedResults.length - 1; i >= 1; i--) {
      const { offer } = allocatedResults[i];
      if (offer === allocatedResults[i - 1]?.offer && !endIdx) {
        // if the next bid is the same offer
        endIdx = i;
        for (let j = endIdx; j >= 1; j--) {
          // loop till start of array to find first differing offer
          if (offer !== allocatedResults[j]?.offer) {
            startIdx = j + 1;
            break;
          }
        }
      }
    }
    return { startIdx, endIdx };
  }

  function allocateToEqualBidders(eqArr) {
    // allocate to the equal bids
    let totals = eqArr.reduce(
      (acc, item) => {
        acc.alloc += item.allocated;
        acc.req += item.requested;
        return acc;
      },
      { req: 0, alloc: 0 }
    );
    eqArr.forEach(
      (item) =>
        (item.allocated = Math.round(
          (item.requested / totals.req) * totals.alloc
        ))
    );
    //Due to rounding - if there is a remainder, allocate it to the first item
    const missingAllocations =
      totals.alloc - eqArr.reduce((acc, item) => acc + item.allocated, 0);
    eqArr[0].allocated += missingAllocations;

    return eqArr;
  }
}
