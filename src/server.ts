import app from './app';

app.listen(app.get('PORT'), () => {
  console.log(`Server started on port http://localhost:${app.get('PORT')}!`);
});
