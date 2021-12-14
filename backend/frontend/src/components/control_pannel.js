import React, { useState } from 'react';
import Select from 'react-select';

const ControlPannel = (props) => {
    const onControlChange = props.onControlChange;

    const default_x = {'value':props.default_control_dict['x'], 'label':props.default_control_dict['x']};
    const default_y = {'value':props.default_control_dict['y'], 'label':props.default_control_dict['y']};
    const default_color = {'value':props.default_control_dict['color'], 'label':props.default_control_dict['color']};
    const default_opacity = {'value':props.default_control_dict['opacity'], 'label':props.default_control_dict['opacity']};
    const default_size = {'value':props.default_control_dict['size'], 'label':props.default_control_dict['size']};

    const [x, setX] = useState(default_x);
    const [y, setY] = useState(default_y);
    const [color, setColor] = useState(default_color);
    const [opacity, setOpacity] = useState(default_opacity);
    const [size, setSize] = useState(default_size);

    const onXChange = (option) => {
        setX(option);
        onControlChange('x', option['value']);
    };
    const onYChange = (option) => {
        setY(option);
        onControlChange('y', option['value']);
    };
    const onColorChange = (option) => {
        setColor(option);
        onControlChange('color', option['value']);
    };
    const onOpacityChange = (option) => {
        setOpacity(option);
        onControlChange('opacity', option['value']);
    };
    const onSizeChange = (option) => {
        setSize(option);
        onControlChange('size', option['value']);
    };

    const x_options = props.quantitative.map((x) => ({'value':x, 'label':x}));
    const y_options = props.quantitative.map((x) => ({'value':x, 'label':x}));
    const color_options1 = props.nominal.map((x) => ({'value':x, 'label':x}));
    const color_options2 = props.ordinal.map((x) => ({'value':x, 'label':x}));
    const color_options = [...color_options1, ...color_options2];
    const opacity_options = props.quantitative.map((x) => ({'value':x, 'label':x}));
    const size_options = props.quantitative.map((x) => ({'value':x, 'label':x}));

    const styles = {
        container: base => ({
            ...base,
            flex: 1
        })
    };

    return (
        <div className="container" style={{float: 'left'}}>
            <div className="row align-items-start">
                <div className="col" style={{display: 'inline-flex'}}>
                    <div style={{paddingRight: '5%'}}>
                        x:
                    </div>
                    <Select 
                        value={x}
                        onChange={onXChange}
                        options={x_options}
                        styles={styles}
                    />
                </div>

                <div className="col" style={{display: 'inline-flex'}}>
                    <div style={{paddingRight: '5%'}}>
                        y:
                    </div>
                    <Select 
                        value={y}
                        onChange={onYChange}
                        options={y_options}
                        styles={styles}
                    />
                </div>

                <div className="col" style={{display: 'inline-flex'}}>
                    <div style={{paddingRight: '5%'}}>
                        Color:
                    </div>
                    <Select 
                        value={color}
                        onChange={onColorChange}
                        options={color_options}
                        styles={styles}
                    />
                </div>

                <div className="col" style={{display: 'inline-flex'}}>
                    <div style={{paddingRight: '5%'}}>
                        Opacity:
                    </div>
                    <Select 
                        value={opacity}
                        onChange={onOpacityChange}
                        options={opacity_options}
                        styles={styles}
                    />
                </div>

                <div className="col" style={{display: 'inline-flex'}}>
                    <div style={{paddingRight: '5%'}}>
                        Size:
                    </div>
                    <Select 
                        value={size}
                        onChange={onSizeChange}
                        options={size_options}
                        styles={styles}
                    />
                </div>

            </div>
        </div>
    )
};

export default ControlPannel;