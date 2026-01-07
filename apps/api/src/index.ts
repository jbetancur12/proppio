import { createApp } from './app';

const port = process.env.PORT || 3000;

createApp().then(({ app }) => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
