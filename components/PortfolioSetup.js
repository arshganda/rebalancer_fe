import React, { Component } from 'react'
import { Image, Grid, Menu, Segment, Header, List, Button, Container, Message } from 'semantic-ui-react'
import { postPortfolioSettings } from '../lib/api'
import { Icon, Input } from 'semantic-ui-react'
import styled from 'styled-components'
import PortfolioDetails from './PortfolioDetails'

import Error from '../components/Error'

import Router, { withRouter } from 'next/router'

import Chart from '../components/Chart'

const FundInputWrapper = styled(Segment)`
  width: 275px;
  display: flex;
  align-items: center;
  padding: 0.5em 1em 0.5em 1em !important; 
`

const SegmentGroupWrapper = styled(Segment.Group)`
width: 275px;
`

const FundInputElement = styled(Input)`
  margin-left: auto;
  width: 100px;
`

const PaddedSegment = styled(Segment)`
  padding: 2em 2em 2em 2em !important; 
`

const FundInputs = ({ portfolio, funds, settings, handleAllocationChange }) => {
  const fundValues = {}

  if (settings) {
    settings.allocations.forEach((allocation) => {
      fundValues[allocation.fundId] = allocation.percentage
    })
  }

  return portfolio.holdings.map((holding) => {
    const fund = funds.find(fund => {
      return fund.fundId === holding.fundId
    })

    return (
      <FundInput key={holding.fundId} fund={fund} initial={fundValues[holding.fundId]} onChange={(evt) => { handleAllocationChange(holding.fundId, evt) }}></FundInput>
    )
  })
}

const FundInput = ({ fund, initial = 0, onChange }) => {
  const { fundName } = fund;

  return (
    <FundInputWrapper>
      <span><b>{fundName}:</b></span>
      <FundInputElement onChange={onChange} defaultValue={initial} type="number" icon={<Icon name='percent' circular />} />
    </FundInputWrapper>
  )
}

const DeviationInput = ({ initial = 0, onChange }) => {
  return (
    <FundInputWrapper>
      <span><b>Desired Deviation:</b></span>
      <FundInputElement defaultValue={initial} onChange={onChange} type="number" icon={<Icon name='percent' circular />} />
    </FundInputWrapper>
  )
}

const DeviationError = ({msg}) => (
  <Message negative>
    <Message.Header>Deviation Error</Message.Header>
    <p>{msg}</p>
  </Message>
)

const AllocationError = ({msg}) => (
  <Message negative>
    <Message.Header>Allocation Error</Message.Header>
    <p>{msg}</p>
  </Message>
)


class PortfolioSetup extends Component {

  constructor(props) {
    super(props)

    const { settings, portfolio } = this.props
    const allocations = {}

    if (settings) {
      settings.allocations.forEach((allocation) => {
        allocations[allocation.fundId] = allocation.percentage
      })

      this.state = {
        allocations,
        deviation: settings.deviation,
        sum: false,
        dev: false
      }
    } else {
      portfolio.holdings.forEach((holding) => {
        allocations[holding.fundId] = 0
      })

      this.state = {
        allocations: allocations,
        deviation: 0,
        sum: false,
        dev: false
      }
    }

    this.handleAllocationChange = this.handleAllocationChange.bind(this)
  }

  async componentDidMount() {

  }

  handleAllocationChange = (fundId, event) => {
    console.log(fundId)
    console.log(event.target.value)

    const allocations = { ...this.state.allocations };
    allocations[fundId] = +event.target.value;

    this.setState({ allocations })
  }

  handleDeviationChange = (event) => {
    this.setState({ deviation: +event.target.value });
  }

  submitAllocation = async (event) => {
    const { allocations, deviation } = this.state;

    // TODO: stretch-goals
    const type = "fund";

    let sum = 0;

    let allocationsData = Object.keys(allocations);

    let negativeFound = false;

    allocationsData.forEach((fundId) => {
      const allocation = allocations[fundId];

      if (allocation < 0) {
        negativeFound = true;
      }

      sum += allocation;
    });

    if (negativeFound) {
      this.setState({sum: "Allocations cannot be negative"})
      return;
    }

    allocationsData = allocationsData.map((fundId) => {
      return {
        fundId,
        percentage: allocations[fundId]
      }
    })

    if (Math.round(sum) === 100 && deviation <= 5 && deviation >= 0) {
      this.setState({ dev: false })
      this.setState({ sum: false })

      const data = await postPortfolioSettings(this.props.portfolio.id, deviation, type, allocationsData)

      if (!data.error) {
        this.props.changeSettings(data);
        this.props.switchPage("MAIN")
      } else {
        this.setState({ sum: false })
      }

      return
    }

    if (deviation > 5) {
      this.setState({ dev: 'Deviation must be less than or equal to 5' })
    } else if (deviation < 0) {
      this.setState({ dev: 'Deviation cannot be negative' })
    } else if (deviation <= 5) {
      this.setState({ dev: false })
    }

  

    if (Math.round(sum) != 100) {
      this.setState({ sum: 'Allocations must sum to 100%' })
    }

    if (Math.round(sum) == 100) {
      this.setState({ sum: false })
    }
  }

  render() {
    const { portfolio, funds, switchPage, settings } = this.props
    const deviation = settings ? settings.deviation : 0
    const displayAll = 'foo'
    
    return (
      <>
        {
          settings != null ?
            (
              <Button labelPosition='left' icon='left chevron' content='Back' onClick={() => { switchPage("MAIN") }} />
            ) :
            <></>
        }
        <PaddedSegment>
        <Grid>
          <Grid.Row>
          <Grid.Column>
          <Header as='h2'>Portfolio Settings</Header>
          <p>Let's setup Robo-Advisor with your portfolio!<br />Enter your ideal fund allocation below.</p>
          </Grid.Column>

          </Grid.Row>
          <Grid.Row columns={2}>
          <Grid.Column>
          {this.state.sum && <div><AllocationError msg={this.state.sum}/></div>}
          {this.state.dev && <div><DeviationError msg={this.state.dev}/></div>}
          <SegmentGroupWrapper>
          <FundInputs portfolio={portfolio} settings={settings} funds={funds} handleAllocationChange={this.handleAllocationChange.bind(this)} />
          </SegmentGroupWrapper>
          <DeviationInput initial={deviation} onChange={this.handleDeviationChange} />
          <Button onClick={this.submitAllocation}>Submit</Button>
          </Grid.Column>
          <Grid.Column>
            {/* <DivMargin> */}
          <PortfolioDetails
            portfolio={portfolio}
            funds={funds}
            displayAll={displayAll}
            />
            {/* </DivMargin> */}
        </Grid.Column>
          </Grid.Row>
         

        

        </Grid>
        </PaddedSegment>
      </>
    )
  }
}

export default withRouter(PortfolioSetup)
