import React, { Component } from 'react'
import { Image, Grid, Menu, Segment, Header, List, Button, Icon, Container, Modal } from 'semantic-ui-react'
import { getRecommendationAvailability, getPortfolioSettings } from '../lib/api'
import Chart from '../components/Chart'
import styled from 'styled-components'

import {
  Tooltip,
} from 'react-tippy';

// Find better way to accomplish colours
const COLOURS = ['#E38627', '#C13C37', '#6A2135', '#E32727', '#CA2358', '#E39327']

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US',
    { style: 'currency', currency: 'USD' }
  ).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US',
    { style: 'decimal' }
  ).format(value)
}

const noRoundFixed = (val, decimals) => {
  var arr = ("" + val).split(".")
  if(arr.length === 1) 
    return val
  var int = arr[0],
      dec = arr[1],
      max = dec.length - 1
  return decimals === 0 ? int :
    [int,".",dec.substr(0, decimals > max ? max : decimals)].join("")
}

const FundId = styled.div`
  background: ${props => props.color || '#e0e1e2'} !important;
  min-height: 1em;
  outline: 0;
  border: none;
  color: #ffffff;
  vertical-align: baseline;
  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
  margin: 0 .25em 0 0;
  padding: .78571429em 1.5em .78571429em;
  text-transform: none;
  text-shadow: none;
  font-weight: 700;
  line-height: 1em;
  font-style: normal;
  text-align: center;
  text-decoration: none;
  border-radius: .28571429rem;
`

const InlineHeading = styled(Header)`
  display: inline;
`

const TransactionItem = ({ transaction, fund, curUnits }) => (
  <List.Item>
    <List.Icon name='usd' size='large' verticalAlign='middle' />
    <List.Content>
      <List.Header>{fund.fundName}</List.Header>
      <List.Description>
        {`${transaction.action === 'buy' ? "Bought" : "Sold"} ${formatNumber(transaction.units)}  ${(transaction.units === 1) ? 'Unit' : 'Units'} |`}
        {transaction.action === 'buy' ? <Icon name='plus' color='green' /> : <Icon name='minus' color='red' />}

        {`${formatCurrency(transaction.units * fund.price.amount)}`}

      </List.Description>
    </List.Content>
  </List.Item>
)


const Transactions = ({ recommendation, funds, portfolio, sum }) => {
  return (
    <>
    <p>We've successfully performed the following actions:</p>
    <List divided relaxed>
      {
        sum > 0 && (
          <List.Item>
              <List.Icon name='usd' size='large' verticalAlign='middle' />
              <List.Content>
                <List.Header>Account Deposit</List.Header>
                <List.Description>
                  {`Deposited ${formatCurrency(sum)}`}
                </List.Description>
              </List.Content>
            </List.Item>
        )
      }

      {recommendation.transactions.map((transaction, index) => {
        if (transaction.units <= 0) {
          return
        }

        const fund = funds.find(fund => {
          return fund.fundId === transaction.fundId
        })

        return (<TransactionItem fund={fund} transaction={transaction} key={index} />)
      })}
    </List>
    </>
  )
}

const ListItem = (props) => (
  <List.Item>
    <List.Content floated='right'>
      <FundId color={props.color}>{`${noRoundFixed(props.fund.value / props.total * 100, 2)} %`}</FundId>
    </List.Content>
    <List.Icon name='usd' size='large' verticalAlign='middle' />
    <List.Content>
    <Tooltip
        // options
        title={`Current Price: ${formatCurrency(props.fund.price)}`}
        position="bottom"
        trigger="click"
      >
      <List.Header as='a'>{props.fund.title}</List.Header>
      <List.Description as='a'>{`${formatCurrency(props.fund.value)} – ${formatNumber(props.fund.units)} Units`}</List.Description>
      </Tooltip>
    </List.Content>
  </List.Item>
)

const AbsoluteIcon = styled(Icon)`
  position: absolute;
  right: 25px;
  top: 25px;
`

const buildData = (portfolio, funds) => {
  const data = []

  portfolio.holdings.forEach((holding, index) => {
    const { fundName, price } = funds.find(fund => {
      return fund.fundId === holding.fundId
    })

    data.push({
      title: fundName,
      value: parseFloat((holding.units * price.amount).toFixed(2)),
      price: price.amount,
      units: holding.units,
      color: COLOURS[index % COLOURS.length]
    })
  });

  return data
}

export default class PortfolioDetails extends Component {

  constructor(props){
    super(props)
    const { args } = props
    this.state = {
      loading: true,
      recommendationsAvailable: null,
      showMsg: args && args.recommendation != null
    }
  }

  handleClose = () => this.setState({ showMsg: false })

  async componentDidMount() {
    // setTimeout(async () => {
      const recommendationsAvailable = await getRecommendationAvailability(this.props.portfolio.id);
      this.setState({loading: false, recommendationsAvailable})    
    // },1000)
  }

  render() {
    const { portfolio, funds, switchPage, displayAll, args = {} } = this.props
    const { loading, recommendationsAvailable, showMsg } = this.state;
    const data = buildData(portfolio, funds)

    return (
      <>
      <Modal dimmer="inverted" size='small' open={showMsg} onClose={this.handleClose}>
          <Modal.Header>Transaction Confirmation</Modal.Header>
          
          <Modal.Content>
          {args.recommendation != "err" ?  <Transactions recommendation={args.recommendation} sum={args.sum} funds={funds} portfolio={portfolio} /> : 
          
          <p>An error occurred. Please check if you have sufficient units to sell.</p>}
           
          </Modal.Content>
          <Modal.Actions>
            <Button labelPosition='right' content='Okay' onClick={this.handleClose} />
          </Modal.Actions>
        </Modal>
      {displayAll != 'foo' &&
        <div>
          <InlineHeading as='h2'>{this.props.title}</InlineHeading>
          <Button floated='right' labelPosition='left' icon='settings' content='Settings' onClick={() => {switchPage("SETUP_MODIFY")}}/>
        </div>
      }
      {displayAll != 'foo' &&
        <Segment>
          <Header as='h3'>Portfolio Balance</Header>
          <Grid columns={2}>
            <Grid.Column>
                <Chart data={data}></Chart>
            </Grid.Column>

            <Grid.Column>
              <List divided relaxed>
                {data.map((fund, index) => (
                  <ListItem color={COLOURS[index % COLOURS.length]} key={fund.title} fund={fund} total={data.reduce((a, c) => a += c.value, 0)} />
                ))}
              </List>
            </Grid.Column>
          </Grid>
        </Segment>
      }
      {displayAll == 'foo' &&
       <Segment>
       <Header as='h3'>Current Portfolio Ratio</Header>
       <Grid columns={1}>

         <Grid.Column>
           <List divided relaxed>
             {data.map((fund, index) => (
               <ListItem color={COLOURS[index % COLOURS.length]} key={fund.title} fund={fund} total={data.reduce((a, c) => a += c.value, 0)} />
             ))}
           </List>
         </Grid.Column>
       </Grid>
     </Segment>
    }
        {displayAll != 'foo' &&       
        <Segment loading={loading}>
          <Header as='h3'>RoboAdvisor Recommendations</Header>
          {loading ? 
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            :
            (recommendationsAvailable ? 
              <>
              <Button floated='right' onClick={() => {switchPage("RECOMMENDATIONS")}}>View Recommendations</Button>

              <p>
                Your portfolio requires some rebalancing! <br />
                Click the button on the right to see what we recommend.
              </p>
              </>
              :
              <>
              
              <AbsoluteIcon size='big' circular color='teal' name='check' />
              <p>
                Your portfolio balance is within your desired deviation. <br />
                No action required.
              </p>
              </>
              )
        }
        </Segment>
        }
        
      </>
    )
  }
}