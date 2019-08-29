import React, { Component } from 'react'
import { Image, Input, Segment, Header, List, Button, Icon, Modal } from 'semantic-ui-react'
import { getPortfolioRecommendations, requestRebalance, postExecuteRecommendation, putModifyRecommendation } from '../lib/api'
import Router, { withRouter } from 'next/router'
import styled from 'styled-components'

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

const InputElement = styled(Input)`
  margin-left: 15px;
  width: 100px;
`

const TransactionItem = ({ transaction, fund, curUnits }) => (
  <List.Item>
    <List.Icon name='usd' size='large' verticalAlign='middle' />
    <List.Content>
      <List.Header>{fund.fundName}</List.Header>
      <List.Description>
        {`${transaction.action === 'buy' ? "Buy" : "Sell"} ${transaction.action === 'sell' ? ` ${formatNumber(transaction.units)} of ${formatNumber(curUnits)}` : formatNumber(transaction.units)} ${(transaction.units === 1 && transaction.action === 'buy') ? 'Unit' : 'Units'} |`}
        {transaction.action === 'buy' ? <Icon name='plus' color='green' /> : <Icon name='minus' color='red' />}

        {`${formatCurrency(transaction.units * fund.price.amount)}`}

      </List.Description>
    </List.Content>
  </List.Item>
)


const Transactions = ({ recommendation, funds, portfolio }) => {
  return (
    <List divided relaxed>
      {recommendation.transactions.map((transaction, index) => {
        if (transaction.units <= 0) {
          return
        }

        const holding = portfolio.holdings.find(h => {
          return h.fundId === transaction.fundId
        })

        const fund = funds.find(fund => {
          return fund.fundId === transaction.fundId
        })

        return (<TransactionItem fund={fund} curUnits={holding.units} transaction={transaction} key={index} />)
      })}
    </List>
  )
}

const ModifyTransactionItem = ({ fund, curVal = 0, initial = 0, onChange, onBuyChange, isBuy }) => {
  const { fundName } = fund;

  return (
    <List.Item>
      <List.Content floated='right'>
        <Button.Group>
          <Button positive={isBuy} onClick={() => onBuyChange(fund.fundId, true)}>Buy</Button>
          <Button.Or />
          <Button negative={!isBuy} onClick={() => onBuyChange(fund.fundId, false)}>Sell</Button>
        </Button.Group>
        <InputElement onChange={(evt) => { onChange(fund.fundId, evt) }} defaultValue={initial} type="number" />
      </List.Content>
      <List.Content verticalAlign='middle'>
        <List.Header>{fundName}</List.Header>
        {isBuy ? <Icon name='plus' color='green' /> : <Icon name='minus' color='red' />}
        {`${formatCurrency(curVal * fund.price.amount)}`}
      </List.Content>

    </List.Item>
  )
}

const ModifyTransactions = ({ modifications, modificationsBuy, portfolio, funds, recommendation, onChange, onBuyChange }) => {
  return (
    <List divided relaxed>
      {portfolio.holdings.map((holding, index) => {
        const fund = funds.find(fund => {
          return fund.fundId === holding.fundId
        })

        const transaction = recommendation.transactions.find(t => {
          return t.fundId === holding.fundId
        })

        // const modification = modifications[fund.fundId]
        const isBuy = modificationsBuy[fund.fundId]

        const initial = transaction ? (transaction.units) : 0
        const curVal = modifications[fund.fundId]

        return (<ModifyTransactionItem fund={fund} curVal={curVal} isBuy={isBuy} initial={initial} holding={holding} onBuyChange={onBuyChange} onChange={onChange} key={index} />)
      })}
    </List>
  )
}

const ClearingDiv = styled.div`
  &:after {
    content: ".";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
  }
`

class PortfolioRecommendations extends Component {

  constructor(props) {
    super(props)


    this.state = {
      loading: true,
      showWarning: false,
      showError: false,
      modifyMode: false
    }

    this.regenerateRecommendations = this.regenerateRecommendations.bind(this)
    this.executeRecommendations = this.executeRecommendations.bind(this)
  }

  handleOpen = (balance) => this.setState({ showWarning: true, balance })
  handleClose = () => this.setState({ showWarning: false })

  handleErrorClose = () => this.setState({ showError: false })

  handleChange = (fundId, event) => {
    const recommendationModifications = { ...this.state.recommendationModifications };
    recommendationModifications[fundId] = Math.round(+event.target.value);

    this.setState({ recommendationModifications })
  }

  handleBuySellChange = (fundId, isBuy) => {
    const recommendationModificationsBuy = { ...this.state.recommendationModificationsBuy };
    recommendationModificationsBuy[fundId] = isBuy;

    this.setState({ recommendationModificationsBuy })
  }

  async componentDidMount() {
    const { portfolio } = this.props
    let recommendation = await getPortfolioRecommendations(portfolio.id)

    if (!recommendation) {
      recommendation = await requestRebalance(portfolio.id)
    }

    const recommendationModifications = {}
    const recommendationModificationsBuy = {}

    portfolio.holdings.forEach((holding) => {
      recommendationModifications[holding.fundId] = 0
      recommendationModificationsBuy[holding.fundId] = true
    })

    recommendation.transactions.forEach((t) => {
      recommendationModifications[t.fundId] = t.units
      recommendationModificationsBuy[t.fundId] = t.action === 'buy'
    })

    this.setState({
      recommendation,
      recommendationModifications,
      recommendationModificationsBuy,
      loading: false
    })
  }

  async regenerateRecommendations() {
    const { portfolio } = this.props

    this.setState({
      loading: true
    })

    const recommendation = await requestRebalance(portfolio.id)

    this.setRecommendationState(recommendation)
  }

  setRecommendationState(recommendation)  {
    const { portfolio } = this.props

    const recommendationModifications = {}
    const recommendationModificationsBuy = {}

    portfolio.holdings.forEach((holding) => {
      recommendationModifications[holding.fundId] = 0
      recommendationModificationsBuy[holding.fundId] = true
    })

    recommendation.transactions.forEach((t) => {
      recommendationModifications[t.fundId] = t.units
      recommendationModificationsBuy[t.fundId] = t.action === 'buy'
    })

    this.setState({
      recommendation,
      recommendationModifications,
      recommendationModificationsBuy,
      modifyMode: false,
      loading: false
    })
  }

  async executeModification() {
    const { portfolio, switchPage, funds } = this.props
    const { recommendation, recommendationModifications, recommendationModificationsBuy } = this.state

    const transactions = [];

    console.log(recommendation)
    console.log(recommendationModifications)

    this.setState({
      loading: true
    })

    Object.keys(recommendationModifications).forEach((fundId) => {
      const oldTransaction = recommendation.transactions.find(t => {
        return t.fundId === +fundId
      })

      if (oldTransaction) {
        console.log(recommendationModifications[fundId])
        const oldAbs = (oldTransaction.action === 'buy' ? 1 : -1) * oldTransaction.units
        const newAbs = (recommendationModificationsBuy[fundId] ? 1 : -1) * recommendationModifications[fundId]

        const diff = newAbs - oldAbs
        
        transactions.push({
          action: "buy",
          fundId,
          units: diff
        })
      } else {
        const abs = (recommendationModificationsBuy[fundId] ? 1 : -1) * recommendationModifications[fundId]

        transactions.push({
          action: "buy",
          fundId,
          units: abs
        })
      }
    })
    console.log(transactions)
    const newRecommendation = await putModifyRecommendation(portfolio.id, recommendation.recommendationId, transactions)
    if (newRecommendation.error) {
      this.setState({showError: newRecommendation.error, loading: false})
    } else {
      this.setRecommendationState(newRecommendation)
    }
  }

  async executeRecommendations(override = false) {
    const { portfolio, switchPage, funds } = this.props
    const { recommendation } = this.state

    
    const sum = recommendation.transactions.reduce((a, c) => {
      const fund = funds.find(fund => {
        return fund.fundId === c.fundId
      })
      return a + ((c.action === 'buy' ? 1 : -1) * (c.units * fund.price.amount))
    }, 0)

    if (!override) {
      if (sum > 0) {
        this.handleOpen(sum);
        return;
      }
    }

    this.setState({
      loading: true,
      showWarning: false
    })

    const response = await postExecuteRecommendation(portfolio.id, recommendation.recommendationId)

    if (response.error) {
      const href = `/?portfolio=${portfolio.id}`
      const as = href
      Router.push(href, as)
      switchPage("MAIN", {recommendation: "err", sum: 0})
    } else {
      const href = `/?portfolio=${portfolio.id}`
      const as = href
      Router.push(href, as)
      switchPage("MAIN", {recommendation, sum})
    }
  }

  render() {
    const { portfolio, funds, switchPage } = this.props
    const { loading, recommendation, showWarning, balance, modifyMode,
      recommendationModifications, recommendationModificationsBuy, showError } = this.state

    return (
      <>
      <Modal
          open={showError}
          onClose={this.handleErrorClose}
          basic
          size='small'
        >
          <Header icon='usd' content='An Error Occurred' />
          <Modal.Content>
            <h3>{showError}</h3>
          </Modal.Content>
          <Modal.Actions>

              <Button color='green' onClick={this.handleErrorClose} inverted>
              Continue
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal
          open={showWarning}
          onClose={this.handleClose}
          basic
          size='small'
        >
          <Header icon='usd' content='Adding additional funds' />
          <Modal.Content>
            <h3>You must add additional funds to execute this recommendation.</h3>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='red' onClick={this.handleClose} inverted>
              <Icon name='remove' /> No
        </Button>
            <Button color='green' onClick={() => this.executeRecommendations(true)} inverted>
              <Icon name='checkmark' /> {`Add ${formatCurrency(balance)}`}
            </Button>
          </Modal.Actions>
        </Modal>

        <ClearingDiv>
          <Button floated='left' labelPosition='left' icon='left chevron' content='Back' onClick={() => { switchPage("MAIN") }} />
          <Button floated='right' labelPosition='right' icon='refresh' content='Regenerate' onClick={this.regenerateRecommendations} />
        </ClearingDiv>

        <Segment loading={loading}>
          <ClearingDiv>
            <Header as='h2' floated='left'>
              <Icon name='chart area' />
              <Header.Content>
                Portfolio Recommendations

                <Header.Subheader>Rebalance your portfolio</Header.Subheader>
              </Header.Content>
            </Header>

            {
              modifyMode
                ?
                
                <>
                  <Button floated='right' labelPosition='right' icon='check' content='Submit' onClick={() => this.executeModification()} />
                  <Button floated='right' labelPosition='right' icon='cancel' content='Cancel' onClick={() => this.setState({ modifyMode: false })} />
                </>
                :
                <>
                  <Button floated='right' labelPosition='right' icon='play' positive content='Execute' onClick={() => this.executeRecommendations()} />
                  <Button floated='right' labelPosition='right' icon='pencil' content='Modify' onClick={() => this.setState({ modifyMode: true })} />
                </>
            }

          </ClearingDiv>
          {loading ?
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            : !modifyMode ?
              <Transactions funds={funds} recommendation={recommendation} portfolio={portfolio} />
              :
              <ModifyTransactions modifications={recommendationModifications} modificationsBuy={recommendationModificationsBuy} recommendation={recommendation} portfolio={portfolio} funds={funds} onChange={this.handleChange} onBuyChange={this.handleBuySellChange} />

          }

        </Segment>
      </>
    )
  }
}

export default withRouter(PortfolioRecommendations)