import React from 'react';
import { CheckCircle2, Clock, Truck, Package, MapPin } from 'lucide-react';
import { Order } from '../types';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const steps = [
    { key: 'ordered', label: 'Order Placed', icon: Package },
    { key: 'packed', label: 'Packed & Quality Check', icon: CheckCircle2 },
    { key: 'shipped', label: 'Shipped from Hub', icon: Truck },
    { key: 'in_transit', label: 'In Transit', icon: Clock },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const statusOrder = ['ordered', 'packed', 'shipped', 'in_transit', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Order Status
          </span>
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <span>#{order.orderNumber}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase font-bold">
              {order.status.replace('_', ' ')}
            </span>
          </h3>
        </div>
        <div className="text-right text-xs">
          <span className="text-gray-500 block">Courier Partner:</span>
          <span className="font-bold text-gray-900">
            {order.courierPartner} • {order.trackingNumber}
          </span>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="py-6 px-2 sm:px-4">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-rose-600 transition-all duration-500 z-0"
            style={{
              width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
            }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-rose-600 text-white shadow-sm ring-4 ring-rose-100'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-2 text-center max-w-[60px] sm:max-w-[80px] leading-tight font-medium ${
                    isCurrent
                      ? 'font-bold text-rose-700'
                      : isCompleted
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Timeline Events */}
      <div className="mt-2 pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Tracking Updates
        </h4>
        <div className="space-y-3 relative pl-4 border-l-2 border-rose-200 ml-2">
          {order.timeline.map((event, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-4 ring-white" />
              <div className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{event.title}</span>
                  <span className="text-[11px] text-gray-400">{event.timestamp}</span>
                </div>
                <p className="text-gray-600 text-[11px] mt-0.5">{event.description}</p>
                {event.location && (
                  <span className="text-[10px] font-semibold text-rose-700 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {event.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
