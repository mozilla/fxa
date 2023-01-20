const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send({
    promotionCode: 'mockPromotionCode',
    type: 'mockType',
    durationInMonths: 12,
    discountAmount: 1000,
  });
});

app.post('/coupon', (req, res) => {
  res.send({
    promotionCode: 'mockPromotionCode',
    type: 'mockType',
    durationInMonths: 12,
    discountAmount: 1000,
  });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
