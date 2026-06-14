const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'yolo.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const yoloProto = grpc.loadPackageDefinition(packageDefinition).yolo;
console.log('yoloProto keys:', Object.keys(yoloProto));

const client = new yoloProto.YoloPose('127.0.0.1:5001', grpc.credentials.createInsecure());
console.log('client keys:', Object.keys(Object.getPrototypeOf(client)));

client.predict({ image: 'data:image/jpeg;base64,123' }, (err, res) => {
  console.log('predict err:', err);
  console.log('predict res:', res);
});

client.Predict({ image: 'data:image/jpeg;base64,123' }, (err, res) => {
  console.log('Predict err:', err);
  console.log('Predict res:', res);
});
