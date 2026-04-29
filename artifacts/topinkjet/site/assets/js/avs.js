// avs.js — Address Verification System (frontend-only).
(function () {
  "use strict";
  const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  function verify(addr) {
    const errors = [];
    if (!addr.street || addr.street.trim().length < 4) errors.push("Street address is required.");
    else if (!/[0-9]/.test(addr.street) || !/[A-Za-z]/.test(addr.street)) errors.push("Street address should include both a number and a street name.");
    if (!addr.city || addr.city.trim().length < 2) errors.push("City is required.");
    else if (!/^[A-Za-z\s\-\.']+$/.test(addr.city)) errors.push("City contains invalid characters.");
    if (!addr.state || !US_STATES.includes(addr.state)) errors.push("Please select a valid US state.");
    if (!addr.zip || !/^[0-9]{5}(-[0-9]{4})?$/.test(addr.zip.trim())) errors.push("ZIP must be 5 digits or ZIP+4 (e.g., 78758 or 78758-1234).");
    return { valid: errors.length === 0, errors };
  }

  window.TI = window.TI || {};
  window.TI.avs = { verify, US_STATES };
})();
