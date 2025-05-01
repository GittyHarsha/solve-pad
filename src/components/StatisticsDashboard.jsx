import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function StatisticsDashboard({ problems }) {
  const total = problems.length;
  const solved = problems.filter((p) => p.solved).length;
  const unsolved = total - solved;
  const totalTime = problems.reduce((a, p) => a + (p.timeSpent||0), 0);
  const avgTime = total? totalTime/total : 0;

  const data = [
    { name: 'Solved', value: solved },
    { name: 'Unsolved', value: unsolved },
  ];
  const COLORS = ['#00C49F','#FF8042'];

  function fmt(s) {
    const h = String(Math.floor(s/3600)).padStart(2,'0');
    const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
    const sec = String(s%60).padStart(2,'0');
    return `${h}:${m}:${sec}`;
  }

  return (
    <div className="p-6 bg-neutral-light h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Statistics Dashboard</h2>
      <div className="space-y-4">
        <div className="flex justify-between"><span>Total Problems:</span><span>{total}</span></div>
        <div className="flex justify-between"><span>Solved:</span><span>{solved}</span></div>
        <div className="flex justify-between"><span>Unsolved:</span><span>{unsolved}</span></div>
        <div className="flex justify-between"><span>Total Time:</span><span>{fmt(totalTime)}</span></div>
        <div className="flex justify-between"><span>Avg Time:</span><span>{fmt(avgTime)}</span></div>
      </div>
      <h3 className="text-xl font-bold mt-8 mb-4">Problem Status</h3>
      <PieChart width={300} height={300}>
        <Pie data={data} cx={150} cy={150} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
          {data.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
        </Pie>
        <Tooltip/>
        <Legend/>
      </PieChart>
    </div>
  );
}

export default StatisticsDashboard;
