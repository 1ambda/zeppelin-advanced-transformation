# zeppelin-advanced-transformation

Advanced Transformation for Zeppelin Helium Visualization

- Detailed axis options
- Dynamic parameters 
- Pretty setting panel

## Usage

## Development

1. Create symbolic links like

```shell
# create sym links
ln -s $PWD/advanced-transformation.js $ZEPPELIN_HOME/zeppelin-web/src/app/tabledata/advanced-transformation.js
ln -s $PWD/advanced-transformation-setting.html $ZEPPELIN_HOME/zeppelin-web/src/app/tabledata/advanced-transformation-setting.html

# install lodash which is not provided by zeppelin
cd $ZEPPELIN_HOME/zeppelin-web; npm i lodash
```

2. Import in Helium Visualizations 

```javascript
import { AdvancedTransformation, } from 'zeppelin-tabledata/advanced-transformation'
```

3. Enable zeppelin-web `dev:helium` env

```shell
cd $ZEPPELIN_HOME/zeppelin-web
npm run dev:helium

# visit localhost:9000
```

## Build (Production)

## License

MIT