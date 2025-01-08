import { createServer } from './server.js';

const app = createServer();
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
