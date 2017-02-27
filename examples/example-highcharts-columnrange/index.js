import Visualization from 'zeppelin-vis'

import AdvancedTransformation from 'zeppelin-advanced-transformation'
import Highcharts from 'highcharts/highcharts'
require('highcharts/highcharts-more.js')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)

console.log('AdvancedTransformation')
console.log(AdvancedTransformation)

export default class ColumnRangeChart extends Visualization {
    constructor(targetEl, config) {
        super(targetEl, config)

        this.spec = {
            /** axis spec */
            axis: {
                'xAxis': { type: 'number', dimension: 'single', group: false, aggregator: false, },
                'yAxis': { type: 'string', dimension: 'multiple', group: true, aggregator: false, },
            },

            /** parameter spec */
            parameter: {
                'xAxisName': { type: 'string', defaultValue: '', description: 'Name of xAxis', },
                'yAxisName': { type: 'string', defaultValue: '', description: 'Name of yAxis', },
                'yAxisUnit': { type: 'string', defaultValue: '', description: 'Unit of yAxis', },
            }
        }

        this.transformation = new AdvancedTransformation(config, this.spec)
    }

    render(transformed) {
        const conf = this.config

        if (!conf.axis['xAxis'] || !conf.axis['yAxis']) {
            return // all axises should be configured to render chart
        }

        /** 1. create data structure */
        const { grouped, } = transformed
        const xAxisColumnIndex = conf.axis['xAxis'].index
        const yAxisValues = grouped.map(g => g.group )
        const data = createDataStructure(xAxisColumnIndex, grouped)

        /** 2. prepare dynamic parameters */
        const { xAxisName, yAxisName, yAxisUnit, } = conf.parameter

        const chartOption = createHighchartOption(yAxisValues, data,
            xAxisName, yAxisName, yAxisUnit)
        Highcharts.chart(this.targetEl[0].id, chartOption)
    }

    getTransformation() {
        return this.transformation
    }
}

export function createDataStructure(xAxisColumnIndex, grouped) {
    return grouped.map(g => {
        const xAxisValues = g.groupedRows.map(r => {
            const xAxisValue = r[xAxisColumnIndex]
            return parseFloat(xAxisValue)
        })

        return [ Math.min(...xAxisValues), Math.max(...xAxisValues), ]
    });
}

export function createHighchartOption(yAxisValues, data,
                                      xAxisName, yAxisName, yAxisUnit) {
    return {
        chart: { type: 'columnrange', inverted: true },
        title: { text: '' },

        xAxis: {
            categories: yAxisValues, /** inverted */
            title: { text: yAxisName, /** inverted */ },
        },
        yAxis: {
            title: { text: `${xAxisName} (${yAxisUnit})` /** inverted */ },
        },

        tooltip: { valueSuffix: yAxisUnit, },

        plotOptions: {
            columnrange: {
                dataLabels: {
                    enabled: true,
                    formatter: function () { return `${this.y} ${yAxisUnit}` }
                }
            }
        },

        legend: { enabled: false },

        series: [{
            name: xAxisName,
            data: data,
        }]
    }
}
