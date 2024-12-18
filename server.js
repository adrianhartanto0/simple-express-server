var express = require('express');
var bodyParser = require('body-parser');
var childProcess = require('child_process');
var app = express();


//Allow all requests from all domains & localhost
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/spawn-long/:symbol', function(req, res) {
  console.log("received spawn request")
  const { query } = req;
  const { data } = query;

  const raw_sell_request_data = data.split(",")

  let new_sell_request_data = {};

  console.log(raw_sell_request_data)

  raw_sell_request_data.forEach(item => {
    const parsed_request_data = JSON.parse(item)
    console.log(parsed_request_data)

    new_sell_request_data = Object.assign(new_sell_request_data, parsed_request_data);
    console.log(new_sell_request_data)
  })

  let sell_request_data_env = Object.values(new_sell_request_data).join(",")

  const cmd = `docker run -d --name ${req.params.symbol} --network=host --memory=10m -e SYMBOL=${req.params.symbol} -e SELL_REQUEST_DATA=${sell_request_data_env} --ipc=host -v /tmp:/tmp --restart=on-failure binance-futures-trade-c`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send(r.output[2]);
  }

  if (r.output[1].length > 0) {
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.post('/spawn/:symbol', function(req, res) {
  console.log("received spawn request")
  const { query } = req;
  const { data } = query;

  const raw_sell_request_data = data.split(",")

  let new_sell_request_data = {};

  console.log(raw_sell_request_data)

  raw_sell_request_data.forEach(item => {
    const parsed_request_data = JSON.parse(item)
    console.log(parsed_request_data)

    new_sell_request_data = Object.assign(new_sell_request_data, parsed_request_data);
    console.log(new_sell_request_data)
  })

  let sell_request_data_env = Object.values(new_sell_request_data).join(",")

  const cmd = `docker run -d --name ${req.params.symbol} --network=host --memory=10m -e SYMBOL=${req.params.symbol} -e SELL_REQUEST_DATA=${sell_request_data_env} --ipc=host -v /tmp:/tmp --restart=on-failure binance-futures-trade-c`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send(r.output[2]);
  }

  if (r.output[1].length > 0) {
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.post('/spawn/new-trade-checker/:symbol', function(req, res) {
  console.log("received new trade checker spawn request")
  const { query } = req;
  const { data } = query;

  console.log(data)

  const cmd = `docker run -d --name ${req.params.symbol}-new-trade-checker --network=host --memory=10m -e SYMBOL=${req.params.symbol} -e CHECK_ORDER_DATA=${data} --ipc=host -v /tmp:/tmp --restart=on-failure new-order-checker`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send(r.output[2]);
  }

  if (r.output[1].length > 0) {
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.post('/spawn/price-checker/:symbol', function(req, res) {
  console.log("received new trade checker spawn request")
  const { query } = req;
  const { data } = query;

  console.log(data)

  const cmd = `docker run -d --name ${req.params.symbol}-price-checker --network=host --memory=10m -e SYMBOL=${req.params.symbol} -e CHECK_PRICE_DATA=${data} --ipc=host -v /tmp:/tmp --restart=on-failure price-checker`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send(r.output[2]);
  }

  if (r.output[1].length > 0) {
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});


app.post('/spawn/non-live/:symbol/:name', function(req, res) {
  const { query } = req;
  const { sell_request_ids, data } = query;

  const raw_sell_request_data = data.split(",")

  let new_sell_request_data = {};

  console.log(raw_sell_request_data)

  raw_sell_request_data.forEach(item => {
    const parsed_request_data = JSON.parse(item)
    console.log(parsed_request_data)

    new_sell_request_data = Object.assign(new_sell_request_data, parsed_request_data);
    console.log(new_sell_request_data)
  })

  let sell_request_data_env = Object.values(new_sell_request_data).join(",")

  console.log(`${req.params.symbol} ${sell_request_ids} ${sell_request_data_env}`)

  const cmd = `docker run -d --name ${req.params.name} --network=host --memory=10m -e SELL_REQUEST_DATA=${sell_request_data_env} -e SYMBOL=${req.params.symbol} --ipc=host -v /tmp:/tmp --restart=on-failure binance-futures-trade-n`;


  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send(`Err spawning ${r.output[2]}`);
  }

  if (r.output[1].length > 0) {
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.delete('/:symbol', function(req, res) {
  console.log("received delete request")

  const cmd = `docker stop ${req.params.symbol}`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send(`Error delete ${r.output[2]}`);
  }

  const cmd_stop = `docker rm ${req.params.symbol}`;
  const res_del =  childProcess.spawnSync("sudo", cmd_stop.split(" "), { encoding: 'utf-8' });

  if (res_del.output[2].length > 0) {
    return res.status(500).send("Error stopping");
  }

  res.sendStatus(200);
});

app.listen(3333);
