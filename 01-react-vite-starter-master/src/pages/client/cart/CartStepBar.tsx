import { Steps } from 'antd';
import {
  ShoppingCartOutlined,
  SolutionOutlined,
  CreditCardOutlined,
  CheckOutlined
} from '@ant-design/icons';

interface CartStepBarProps {
  currentStep: number;
}

const CartStepBar = ({ currentStep }: CartStepBarProps) => {
  const stepsItems = [
    {
      title: 'Đơn hàng',
      status: currentStep > 0 ? 'finish' as const : 'process' as const,
      icon: currentStep > 0 ? <CheckOutlined /> : <ShoppingCartOutlined />,
    },
    {
      title: 'Đặt hàng',
      status: currentStep === 1 ? 'process' as const : (currentStep > 1 ? 'finish' as const : 'wait' as const),
      icon: currentStep > 1 ? <CheckOutlined /> : <SolutionOutlined />,
    },
    {
      title: 'Thanh toán',
      status: currentStep === 2 ? 'process' as const : 'wait' as const,
      icon: <CreditCardOutlined />,
    },
  ];

  return (
    <div className="steps-progress-wrapper">
      <Steps
        size="small"
        current={currentStep}
        items={stepsItems}
      />
    </div>
  );
};

export default CartStepBar;
