import PieChart from 'react-minimal-pie-chart';
import React, { Component } from 'react'
import styled from 'styled-components';

import 'react-tippy/dist/tippy.css'
import {
  Tooltip,
} from 'react-tippy';

/**
 * Wraps PieChart with Tooltip component
 */


const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US',
    { style: 'currency', currency: 'USD' }
  ).format(value)
}

const ChartWrapper = styled.div`
  position: relative;
  width: 200px;
`

const TextContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 25px;
  font-weight: 700;
`

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.setIsOpen = this.setIsOpen.bind(this);
    this.setTooltipContent = this.setTooltipContent.bind(this);

    this.state = {
      open: false,
      tooltipContent: 'Test'
    };
  }

  setIsOpen(state) {
    this.setState({ open: state });
  }

  setTooltipContent(content) {
    this.setState({ tooltipContent: content });
  }
  
  render() {return (
    <ChartWrapper>
      <TextContainer>
        {formatCurrency(this.props.data.reduce((acc, cv) => acc += cv.value, 0))}
      </TextContainer>

    <Tooltip
      followCursor
      title={this.state.tooltipContent}
      open={this.state.open}
      onRequestClose={() => { this.setIsOpen(false) }}
    >
      <PieChart
        style={{ width: 200 }}
        animate
        lineWidth={15}
        rounded
        data={this.props.data}
        onMouseOver={
          (_event, data, dataIndex) => {
            const total = data.reduce((acc, cv) => acc += cv.value, 0)

            this.setTooltipContent(`${data[dataIndex].title} – ${formatCurrency(data[dataIndex].value)} – ${(data[dataIndex].value / total  * 100).toFixed(2)}%`)
            this.setIsOpen(true)
          }
        }
        onMouseOut={
          (_event, _data, _dataIndex) => {
            this.setIsOpen(false)
          }
        }
      />
    </Tooltip>
    </ChartWrapper>)
  }
}