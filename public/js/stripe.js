var stripe = Stripe('pk_test_NQDVcesKEQVQLwu0fOTra56C');
var elements = stripe.elements();

var card = elements.create('card', {
  style: {
    base: {
      iconColor: '#666EE8',
      color: '#31325F',
      lineHeight: '40px',
      fontWeight: 300,
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSize: '15px',

      '::placeholder': {
        color: '#CFD7E0',
      },
    },
  }
});
card.mount('#card-element');

//réponse de l'API 

function setOutcome(result) {

  var input = document.createElement("input");

  var successElement = document.querySelector('.success');
  var errorElement = document.querySelector('.error');
  successElement.classList.remove('visible');
  errorElement.classList.remove('visible');

  input.name ='token';
  input.value=result.token.id;
  document.querySelector('form').appendChild(input);
  document.querySelector('form').submit();

  // if (result.token) {
  //   // Use the token to create a charge or a customer
  //   // https://stripe.com/docs/charges
  //   successElement.querySelector('.token').textContent = result.token.id;
  //   successElement.classList.add('visible');
  
  // } else if (result.error) {
  //   errorElement.textContent = result.error.message;
  //   errorElement.classList.add('visible');
  // }

  console.log(result.token.id);

}

// Validation du formulaire 

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();

  var form = document.querySelector('form');

  var extraDetails = {
    name : form.querySelector('input[name=cardholder-name]').value,
  };
  stripe.createToken(card, extraDetails).then(setOutcome);
});


