// functions/index.js
exports.initiateMTNPayment = functions.https.onCall(async (data, context) => {
    const phone = data.phone.replace('+237', ''); // Convert +2376... to 6...
    
    const response = await fetch('https://sandbox.momodeveloper.mtn.com/collection/v2/request', {
      method: 'POST',
      headers: {
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': '6618627a1fd14f03b6f9a4bd3bbbb3e9',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: '2300',
        currency: 'XAF',
        externalId: 'YOUR_ORDER_ID',
        payer: {
          partyIdType: 'MSISDN',
          partyId: phone
        }
      })
    });
  
    return response.json();
  });
  // functions/index.js
exports.mtnWebhook = functions.https.onRequest(async (req, res) => {
    // Verify signature using secondary key
    const signature = crypto
      .createHmac('sha256', 'ee5b6deb69b041b589665098ccb95c68')
      .update(JSON.stringify(req.body))
      .digest('hex');
  
    if (signature !== req.headers['x-callback-signature']) {
      return res.status(401).send();
    }
  
    // Update Firestore
    await admin.firestore().collection('payments')
      .doc(req.body.transactionId)
      .set({
        status: req.body.status,
        amount: req.body.amount,
        phone: req.body.payer.phone
      });
  
    res.status(200).send();
  });