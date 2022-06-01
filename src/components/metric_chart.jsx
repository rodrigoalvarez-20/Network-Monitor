import Paper from '@mui/material/Paper';
import {
    Chart,
    ArgumentAxis,
    ValueAxis,
    LineSeries,
    Title,
    Legend,
} from '@devexpress/dx-react-chart-material-ui';
import { Animation, ValueScale } from '@devexpress/dx-react-chart';
import { line, curveStep } from 'd3-shape';
import { useEffect, useState } from 'react';

const Line = props => (
    <LineSeries.Path
        {...props}
        path={line()
            .x(({ arg }) => arg)
            .y(({ val }) => val)
            .curve(curveStep)}
    />
);

const Root = props => (
    <Legend.Root {...props} sx={{ display: 'flex', margin: 'auto', flexDirection: 'row' }} />
);
const Label = props => (
    <Legend.Label {...props} sx={{ whiteSpace: 'nowrap' }} />
);

const Marker = (props) => {
    const { className, color } = props;
    return (
        <svg className={className} fill={color} width="10" height="10">
            <rect x={0} y={0} width={10} height={10} />
        </svg>
    );
};

const MetricsChart = (props) => {
    const [actualData, setActualData] = useState([]);
    const [chartTitle, setChartTitle] = useState("");
    const [packetsType, setPacketsType] = useState("")
    const [lineColor, setLineColor] = useState("#cd7f32");

    const modifyDomain = domain => [-7, domain[domain.length -1] + 5];

    useEffect(() => {
        const { metrics, title, type, color } = props;
        setActualData(metrics)
        setChartTitle(title);
        setPacketsType(type);
        setLineColor(color)
    }, [props])


    return (
        <Paper>
            <Chart
                data={actualData} >
                <ValueScale modifyDomain={modifyDomain} />
                <ArgumentAxis />
                <ValueAxis />

                <LineSeries
                    name={packetsType}
                    valueField="packets"
                    argumentField="time"
                    color={lineColor}
                    seriesComponent={Line}
                />
                <Legend position="bottom" rootComponent={Root} labelComponent={Label} markerComponent={Marker} />
                <Title
                    text={chartTitle}
                />
                <Animation />
            </Chart>
        </Paper>
    )


}

export default MetricsChart