import { Component } from 'react'
import { signInUser } from '../../lib/auth'
import Layout from '../../components/MyLayout.js'
import { Form, Button, Message } from 'semantic-ui-react'

class SignIn extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null
        };
    }

    handleSubmit = async event => {
        event.preventDefault();
        const customerId = event.target.elements.username.value

        if (!customerId) {
            this.setState({
                error: "Please complete all the fields."
            });
        } else {
            const error = await signInUser(customerId)
            if (error) {
                this.setState({
                    error
                });
            }
        }
    }
    render() {
        return (
            <Layout page='SIGNIN'>
                <h1>Sign in</h1>
                {this.state.error && <Message negative>
                    <Message.Header>An error has occurred.</Message.Header>
                    <p>{this.state.error}</p>
                </Message>}
                <Form onSubmit={this.handleSubmit}>

                    <Form.Field>
                        <label>Customer ID</label>
                        <input type="text" placeholder="Customer ID" name="username" />
                    </Form.Field>

                    <Button type="submit">Login</Button>

                </Form>
            </Layout>
        )
    }

}

export default SignIn