import React from 'react';
import { injectStripe, CardElement } from 'react-stripe-elements';

class SubscriptionForm extends React.Component {
  
  render() {
    const {
      plansByProductId,
    } = this.props;
    
    return (
      <form onSubmit={this.handleSubmit}>
        <ul>
          <li>
            <p>Plans</p>
            <ul>
            {plansByProductId.length === 0 ? (
              <li>No plans found.</li>
            ) : (
              plansByProductId.map(({ plan_id, product_id }) => (
                <li key={plan_id}>
                  <input type="radio" name="plan_id" value={plan_id} /> {plan_id}
                </li>
              ))
            )}
            </ul>
          </li>
          <li>
            <p>Name</p>
            <input name="name" />
          </li>
          <li>
            <p>Card details (e.g. 4242 4242 4242 4242)</p>
            <CardElement style={{base: {fontSize: '18px'}}} />
          </li>
          <li>
            <p>Confirm</p>
            <button>Confirm order</button>
          </li>
        </ul>
      </form>
    );
  }

  handleSubmit = (ev) => {
    const {
      createSubscription,
    } = this.props;
    
    ev.preventDefault();
    
    const data = new FormData(ev.target);    
    const [ plan_id, name ] =
      [ 'plan_id', 'name' ].map(name => data.get(name));

    this.props.stripe
      .createToken({ type: 'card', name })
      .then(result => {
        console.log("RESULT", result);
        
        createSubscription({
          planId: plan_id,
          paymentToken: result.token.id
        });
      });
  };
}

export default injectStripe(SubscriptionForm);
