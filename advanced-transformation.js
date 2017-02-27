
/**
 * IMPORTANT:
 *
 * These variables are replaced by gulp.
 *
 * Thus, if you want to modify this (e.g variable name, indentation, ...)
 * you have to edit the configuration (`gulpfile.js`) as well.
 */
const lo = _
const Transformation = require('./transformation')
const SETTING_TEMPLATE = 'app/tabledata/advanced-transformation-setting.html'
/** END */

console.log('Transformation')
console.log(Transformation)

function isAggregator(axisSpec) { return axisSpec.aggregator }
function isGroup(axisSpec) { return axisSpec.group }
function isSingleDimension(axisSpec) { return axisSpec.dimension === 'single' }

const Aggregator = {
    SUM: 'sum',
    COUNT: 'count',
    AVG: 'avg',
    MIN: 'min',
    MAX: 'max',
}

function getGroupAndAggrColumns(axisSpecs, axisConfig) {
    const groupAxisNames = []
    const aggrAxisNames = []

    for(let i = 0; i < axisSpecs.length; i++) {
        const axisSpec = axisSpecs[i]

        // if duplicated, use it as `group`
        if (isGroup(axisSpec)) { groupAxisNames.push(axisSpec.name) }
        else if (isAggregator(axisSpec)) { aggrAxisNames.push(axisSpec.name) }
    }

    let groupColumns = [] /** `group` */
    let aggregatedColumns = [] /** `aggregator` */
    let normalColumns = [] /** specified, but not group and aggregator */

    for(let colName in axisConfig) {
        const columns = axisConfig[colName]
        if (groupAxisNames.includes(colName)) {
            groupColumns = groupColumns.concat(columns)
        } else if (aggrAxisNames.includes(colName)) {
            aggregatedColumns = aggregatedColumns.concat(columns)
        } else {
            normalColumns = normalColumns.concat(columns)
        }
    }

    return {
        groupColumns: groupColumns,
        aggregatedColumns: aggregatedColumns,
        normalColumns: normalColumns,
    }
}

function getConfiguredColumnIndices(allColumns, configuredColumns) {

    const configuredColumnNames = configuredColumns.map(c => c.name)

    const configuredColumnIndices = allColumns.reduce((acc, c) => {
        if (configuredColumnNames.includes(c.name)) { return acc.concat(c.index) }
        else { return acc }
    }, [])

    return configuredColumnIndices
}

function groupAndAggregateRows(rows, groupColumns, aggregatedColumns) {
    const groupColumnIndices = groupColumns.map(c => c.index)

    const converted = lo.chain(rows)
        .groupBy(row => {
            /** 1. group */
            let group = ''

            for (let i = 0; i < groupColumnIndices.length; i++) {
                const colIndex = groupColumnIndices[i]
                const colValue = row[colIndex]

                if (group === '') { group = colValue }
                else { group = `${group}.${colValue}` }
            }

            return group
        })
        .map((groupedRows, groupKey) => {
            /** 2. aggregate */
            const aggregated = {}

            // avoid unnecessary computation
            if (!groupColumns.length || !groupedRows.length) {
                return { group: groupKey, groupedRows: groupedRows, aggregated: aggregated, }
            }

            // accumulate columnar values to compute
            const columnar = {}
            for (let i = 0; i < groupedRows.length; i++) {
                const row = groupedRows[i]

                for(let j = 0; j < aggregatedColumns.length; j++) {
                    const aggrColumn = aggregatedColumns[j]
                    if (!columnar[aggrColumn.name]) {
                        columnar[aggrColumn.name] = { aggregator: aggrColumn.aggr, values: [], }
                    }

                    const colValue = row[aggrColumn.index]
                    columnar[aggrColumn.name].values.push(colValue)
                }
            }

            // execute aggregator functions
            for(let aggrColName in columnar) {
                const { aggregator, values, } = columnar[aggrColName]
                let computed = null

                try {
                    switch(aggregator) {
                        case Aggregator.SUM: computed = lo.sum(values); break
                        case Aggregator.COUNT: computed = values.length; break
                        case Aggregator.AVG: computed = lo.sum(values) / values.length; break
                        case Aggregator.MIN: computed = lo.min(values); break
                        case Aggregator.MAX: computed = lo.max(values); break
                    }
                } catch(error) {
                    console.error(`Failed to compute aggregator: ${aggregator} on the field ${aggrColName}`, error)
                }

                aggregated[aggrColName] = computed
            }

            return { group: groupKey, groupedRows: groupedRows, aggregated: aggregated, }
        })
        .value()

    return converted
}

class AdvancedTransformation extends Transformation {
    constructor(config, spec) {
        super(config)

        this.columns = [] /** [{ name, index, comment }] */
        this.props = {}

        /**
         * spec.axis: [{ name, dimension, type, aggregator, group }]
         * spec.parameter: [{ name, type, defaultValue, description }]
         *
         * add the `name` field while converting to array to easily manipulate
         */
        const axisSpecs = []
        for (let name in spec.axis) {
            const axisSpec = spec.axis[name]
            axisSpec.name = name
            axisSpecs.push(axisSpec)
        }
        this.axisSpecs = axisSpecs

        const paramSpecs = []
        for (let name in spec.parameter) {
            const parameterSpec = spec.parameter[name]
            parameterSpec.name = name
            paramSpecs.push(parameterSpec)
        }
        this.paramSpecs = paramSpecs

        /** initialize config.axis */
        if (!this.config.axis) { this.config.axis = {} }
        for (let i = 0; i < axisSpecs.length; i++) {
            const axisSpec = axisSpecs[i]
            const persistedConfig = this.config.axis[axisSpec.name]

            // // behavior of jqyoui-element depends on its model (ng-model)
            // // so, we have to initialize its underlying ng-model to array if it's not array
            if (!isSingleDimension(axisSpec) && !Array.isArray(persistedConfig)) {
                this.config.axis[axisSpec.name] = []
            } else if (isSingleDimension(axisSpec) && Array.isArray(persistedConfig)) {
                this.config.axis[axisSpec.name] = {}
            }
        }

        /** initialize config.parameter*/
        if (!this.config.parameter) { this.config.parameter = {} }
        for (let i = 0; i < paramSpecs.length; i++) {
            const paramSpec = paramSpecs[i]
            if (!this.config.parameter[paramSpec.name]) {
                this.config.parameter[paramSpec.name] = paramSpec.defaultValue
            }
        }

        /** initialize config.panel */
        if (!this.config.panel) {
            this.config.panel = { columnPanelOpened: true, parameterPanelOpened: true, }
        }
    }

    getSetting() {
        const self = this /** for closure */
        /**
         * config: { axis, parameter }
         */
        const configInstance = self.config /** for closure */

        return {
            template: SETTING_TEMPLATE,
            scope: {
                config: configInstance,
                columns: self.columns,
                axisSpecs: self.axisSpecs,
                paramSpecs: self.paramSpecs,

                getAxisAnnotation: (axisSpec) => {
                    return `${axisSpec.name} (${axisSpec.type})`
                },

                isAggregatorAxis: (axisSpec) => {
                    return isAggregator(axisSpec)
                },

                toggleColumnPanel: () => {
                    configInstance.panel.columnPanelOpened =
                        !configInstance.panel.columnPanelOpened
                    self.emitConfig(configInstance)
                },

                toggleParameterPanel: () => {
                    configInstance.panel.parameterPanelOpened =
                        !configInstance.panel.parameterPanelOpened
                    self.emitConfig(configInstance)
                },

                isGroupAxis: (axisSpec) => {
                    return isGroup(axisSpec)
                },

                isSingleDimensionAxis: (axisSpec) => {
                    return isSingleDimension(axisSpec)
                },

                parameterChanged: (paramSpec) => {
                    self.emitConfig(configInstance)
                },

                aggregatorChanged: (colIndex, axisName, aggregator) => {
                    configInstance.axis[axisName][colIndex].aggr = aggregator
                    self.emitConfig(configInstance)
                },

                axisChanged: function(e, ui, axisSpec) {
                    self.emitConfig(configInstance)
                },

                removeFromSingleDimension: function(axisName) {
                    configInstance.axis[axisName] = null
                    self.emitConfig(configInstance)
                },

                removeFromMultipleDimension: function(colIndex, axisName) {
                    configInstance.axis[axisName].splice(colIndex, 1)
                    self.emitConfig(configInstance)
                },
            }
        }
    }

    transform(tableData) {
        this.columns = tableData.columns /** used in `getSetting` */
        const axisSpecs = this.axisSpecs /** specs */
        const axisConfig = this.config.axis /** configured columns */

        const {
                groupColumns, aggregatedColumns, normalColumns
            } = getGroupAndAggrColumns(axisSpecs, axisConfig)

        const grouped = groupAndAggregateRows(tableData.rows, groupColumns, aggregatedColumns)

        return {
            raw: tableData.rows,
            grouped: grouped, /** [{ group, groupedRows, aggregated }] */
            column: {
                allColumns: tableData.columns,
                groupColumns: groupColumns,
                aggregatedColumns,
                normalColumns: normalColumns,
            }
        }
    }
}

export default AdvancedTransformation
