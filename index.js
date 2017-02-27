
/**
 * IMPORTANT:
 *
 * These variables are replaced by gulp.
 *
 * Thus, if you want to modify this (e.g variable name, indentation, ...)
 * you have to edit the configuration (`gulpfile.js`) as well.
 */
const lo = _
import Transformation from 'zeppelin-tabledata/transformation'
const SETTING_TEMPLATE = `<div class="panel panel-default" style="margin-top: 10px; margin-bottom: 11px;">

    <!-- panel: axis (configured column) information -->
    <div class="panel-heading"
         style="padding: 6px 12px 6px 12px; font-size: 13px;">
        <span style="vertical-align: middle; display: inline-block; margin-top: 3px;">Configured Columns</span>
        <span style="float: right;">
          <div class="btn-group" role="group" aria-label="...">
            <div type="button" ng-if="config.panel.columnPanelOpened"
                 ng-click="toggleColumnPanel()"
                 class="btn btn-default" style="padding: 2px 5px 2px 5px;">
              <i class="fa fa-minus" style="font-size: 12px;" aria-hidden="true"></i>
            </div>
            <div type="button" ng-if="!config.panel.columnPanelOpened"
                 ng-click="toggleColumnPanel()"
                 class="btn btn-default" style="padding: 2px 5px 2px 5px;">
              <i class="fa fa-expand" style="font-size: 11px;" aria-hidden="true"></i>
            </div>
          </div>
        </span>
        <div style="clear: both;"></div> <!-- to fix previous span which has float: right -->
    </div>
    <div class="panel-body" ng-if="config.panel.columnPanelOpened"
         style="margin-top: 7px; padding-top: 9px; padding-bottom: 4px;">
        <div class="row">
            <div class="col-sm-4 col-md-3"
                 ng-repeat="axisSpec in axisSpecs">
        <span class="columns lightBold">
          <!-- axis name -->
          <span class="label label-default"
                style="font-weight: 300; font-size: 13px; margin-left: 1px;">
            {{getAxisAnnotation(axisSpec)}}
          </span>
          <span ng-if="isAggregatorAxis(axisSpec)"
                class="label label-default"
                style="background-color: #5782bd; font-weight: 300; font-size: 13px; margin-left: 3px;">
            aggregator
          </span>
          <span ng-if="isGroupAxis(axisSpec)"
                class="label label-default"
                style="background-color: #CD5C5C; font-weight: 300; font-size: 13px; margin-left: 3px;">
            group by
          </span>

            <!-- axis box: in case of single dimension -->
          <ul data-drop="true"
              ng-if="isSingleDimensionAxis(axisSpec)"
              ng-model="config.axis[axisSpec.name]"
              jqyoui-droppable="{onDrop:'axisChanged(axisSpec)'}"
              class="list-unstyled"
              style="height:36px; border-radius: 6px; margin-top: 7px;">
            <li ng-if="config.axis[axisSpec.name]">
              <!-- in case of axis is single dimension and not aggregator -->
              <div ng-if="!isAggregatorAxis(axisSpec)"
                   class="btn btn-default btn-xs"
                   style="background-color: #EFEFEF;">
                {{config.axis[axisSpec.name].name}}
                <span class="fa fa-close" ng-click="removeFromSingleDimension(axisSpec.name)"></span>
              </div>

            </li>
          </ul>

            <!-- axis box: in case of multiple dimensions -->
          <ul data-drop="true"
              ng-if="!isSingleDimensionAxis(axisSpec) "
              ng-model="config.axis[axisSpec.name]"
              jqyoui-droppable="{multiple: true, onDrop:'axisChanged(axisSpec)'}"
              class="list-unstyled"
              style="height:130px; border-radius: 6px; margin-top: 7px;">
            <li ng-repeat="col in config.axis[axisSpec.name]">
              <!-- in case of axis is multiple dimensions and not aggregator -->
              <div ng-if="!isAggregatorAxis(axisSpec)"
                   class="btn btn-default btn-xs"
                   style="background-color: #EFEFEF;">
                {{col.name}}
                <span class="fa fa-close" ng-click="removeFromMultipleDimension($index, axisSpec.name)"></span>
              </div>

                <!-- in case of axis is multiple dimension and aggregator -->
              <div class="btn-group">
                <div ng-if="isAggregatorAxis(axisSpec)"
                     class="btn btn-default btn-xs dropdown-toggle"
                     style="background-color: #EFEFEF;"
                     type="button" data-toggle="dropdown">
                  {{col.name | limitTo: 30}}{{col.name.length > 30 ? '...' : ''}}
                  <span style="color:#717171;">
                    <span class="lightBold" style="text-transform: uppercase;">{{col.aggr}}</span>
                  </span>
                  <span class="fa fa-close" ng-click="removeFromMultipleDimension($index, axisSpec.name)"></span>
                </div>
                <ul class="dropdown-menu" role="menu">
                  <li ng-click="aggregatorChanged($index, axisSpec.name, 'sum')"><a>sum</a></li>
                  <li ng-click="aggregatorChanged($index, axisSpec.name, 'count')"><a>count</a></li>
                  <li ng-click="aggregatorChanged($index, axisSpec.name, 'avg')"><a>avg</a></li>
                  <li ng-click="aggregatorChanged($index, axisSpec.name, 'min')"><a>min</a></li>
                  <li ng-click="aggregatorChanged($index, axisSpec.name, 'max')"><a>max</a></li>
                </ul>
              </div>

            </li>
          </ul>

        </span>
            </div>
        </div>
    </div>

    <!-- panel: available columns -->
    <div class="panel-heading" ng-if="config.panel.columnPanelOpened"
         style="padding: 6px 12px 6px 12px; font-size: 13px; border-top: 1px solid #ddd; border-top-left-radius: 0px; border-top-right-radius: 0px;">
        <span>Available Columns</span>
    </div>
    <div class="panel-body" ng-if="config.panel.columnPanelOpened"
         style="padding: 8px; margin-top: 3px;">
        <ul class="noDot">
            <li class="liVertical" ng-repeat="column in columns">
                <div class="btn btn-default btn-xs"
                     style="background-color: #EFEFEF;"
                     data-drag="true"
                     data-jqyoui-options="{revert: 'invalid', helper: 'clone'}"
                     ng-model="columns"
                     jqyoui-draggable="{index: {{$index}}, placeholder: 'keep'}">
                    {{column.name | limitTo: 30}}{{column.name.length > 30 ? '...' : ''}}
                </div>
            </li>
        </ul>
    </div>

</div>

<!-- panel: parameter information -->
<div class="panel panel-default">
    <div class="panel-heading" style="padding: 6px 12px 6px 12px; font-size: 13px;">
        <span style="vertical-align: middle; display: inline-block; margin-top: 3px;">Dynamic Parameters</span>
        <span style="float: right;">
          <div class="btn-group" role="group" aria-label="...">
            <div type="button"
                 ng-click="parameterChanged()"
                 class="btn btn-default" style="padding: 2px 5px 2px 5px;">
              <i class="fa fa-floppy-o" aria-hidden="true"></i>
            </div>
            <div type="button" ng-if="config.panel.parameterPanelOpened"
                 ng-click="toggleParameterPanel()"
                 class="btn btn-default" style="padding: 2px 5px 2px 5px;">
              <i class="fa fa-minus" style="font-size: 12px;" aria-hidden="true"></i>
            </div>
            <div type="button" ng-if="!config.panel.parameterPanelOpened"
                 ng-click="toggleParameterPanel()"
                 class="btn btn-default" style="padding: 2px 5px 2px 5px;">
              <i class="fa fa-expand" style="font-size: 11px;" aria-hidden="true"></i>
            </div>
          </div>
        </span>
        <div style="clear: both;"></div> <!-- to fix previous span which has float: right -->
    </div>

    <div class="panel-body" ng-if="config.panel.parameterPanelOpened"
         style="padding-top: 13px; padding-bottom: 13px;">
        <table class="table table-striped">
            <tr>
                <th style="font-size: 12px; font-style: italic">Name</th>
                <th style="font-size: 13px; font-style: italic">Type</th>
                <th style="font-size: 12px; font-style: italic">Description</th>
                <th style="font-size: 12px; font-style: italic">Value</th>
            </tr>
            <tr>
            </tr>
            <tr data-ng-repeat="paramSpec in paramSpecs">
                <td style="font-weight: 400; vertical-align: middle;">{{paramSpec.name}}</td>
                <td style="font-weight: 400; vertical-align: middle;">{{paramSpec.type}}</td>
                <td style="font-weight: 400; vertical-align: middle;">{{paramSpec.description}}</td>
                <td>
                    <div class="input-group">
                        <input type="text" class="form-control"
                               style="font-weight: 400; font-size: 12px; vertical-align:middle; border-radius: 5px;"
                               data-ng-model="config.parameter[paramSpec.name]" />
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>
`
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
