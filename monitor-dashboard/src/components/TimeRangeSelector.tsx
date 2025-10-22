import React from 'react';
import { Select, Space } from 'antd';
import { TimeRangeOption } from '../types/monitor';

const { Option } = Select;

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const timeRangeOptions: TimeRangeOption[] = [
  { value: '1h', label: '最近1小时' },
  { value: '24h', label: '最近24小时' },
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
];

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  return (
    <Space>
      <span>时间范围:</span>
      <Select value={value} onChange={onChange} style={{ width: 120 }}>
        {timeRangeOptions.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Space>
  );
};

export default TimeRangeSelector;