
const job = {
  name: "TS0001",
  ref: "TS0001",
  pre_url: "https://tictap.me/track/",
  qty: "11",
  qtyDone: "0",
  rom: "0",
  status: "start"
};


const query = "INSERT INTO jobs(\`name\`,ref,pre_url,uid_len,qty,qtydone,rom,\`status\`,modified_at) VALUES("
  + job.name +","
  + job.ref + ","
  + job.pre_url + ","
  + job.qty + ","
  + job.qtyDone + ","
  + job.rom + ","
  + job.status + ","
  + Date.now()
  + ");"


console.log(query);
