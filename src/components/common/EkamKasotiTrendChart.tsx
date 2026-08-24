import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, Award, Calendar, ChevronDown, Sparkles, Target, BarChart2 } from 'lucide-react';

export interface EkamKasotiDataPoint {
  testId: string;
  testName: string;
  guTestName: string;
  date: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  classAverage: number;
  grade: string;
  subjects: {
    name: string;
    guName: string;
    max: number;
    obtained: number;
  }[];
}

export interface ChartDataPoint extends EkamKasotiDataPoint {
  displayValue: number;
  label: string;
  subObtained?: number;
  subMax?: number;
}

interface EkamKasotiTrendChartProps {
  studentName?: string;
  className?: string;
  compact?: boolean;
  showSubjectFilter?: boolean;
  customData?: EkamKasotiDataPoint[];
}

export const DEFAULT_EKAM_KASOTI_HISTORY: EkamKasotiDataPoint[] = [
  {
    testId: 'ek-1',
    testName: 'Ekam Kasoti 1 (July)',
    guTestName: 'એકમ કસોટી ૧ (જુલાઈ)',
    date: '2026-07-28',
    maxMarks: 150,
    obtainedMarks: 131,
    percentage: 87.3,
    classAverage: 74.5,
    grade: 'A2',
    subjects: [
      { name: 'Mathematics', guName: 'ગણિત', max: 25, obtained: 22 },
      { name: 'Science & Tech', guName: 'વિજ્ઞાન', max: 25, obtained: 21 },
      { name: 'Social Science', guName: 'સામાજિક વિજ્ઞાન', max: 25, obtained: 21 },
      { name: 'Gujarati FL', guName: 'ગુજરાતી', max: 25, obtained: 23 },
      { name: 'English SL', guName: 'અંગ્રેજી', max: 25, obtained: 22 },
      { name: 'Computer Studies', guName: 'કમ્પ્યુટર', max: 25, obtained: 22 },
    ],
  },
  {
    testId: 'ek-2',
    testName: 'Ekam Kasoti 2 (August)',
    guTestName: 'એકમ કસોટી ૨ (ઓગસ્ટ)',
    date: '2026-08-26',
    maxMarks: 150,
    obtainedMarks: 136,
    percentage: 90.7,
    classAverage: 76.2,
    grade: 'A1',
    subjects: [
      { name: 'Mathematics', guName: 'ગણિત', max: 25, obtained: 23 },
      { name: 'Science & Tech', guName: 'વિજ્ઞાન', max: 25, obtained: 23 },
      { name: 'Social Science', guName: 'સામાજિક વિજ્ઞાન', max: 25, obtained: 22 },
      { name: 'Gujarati FL', guName: 'ગુજરાતી', max: 25, obtained: 24 },
      { name: 'English SL', guName: 'અંગ્રેજી', max: 25, obtained: 22 },
      { name: 'Computer Studies', guName: 'કમ્પ્યુટર', max: 25, obtained: 22 },
    ],
  },
  {
    testId: 'ek-3',
    testName: 'Ekam Kasoti 3 (September)',
    guTestName: 'એકમ કસોટી ૩ (સપ્ટેમ્બર)',
    date: '2026-09-24',
    maxMarks: 150,
    obtainedMarks: 140,
    percentage: 93.3,
    classAverage: 77.8,
    grade: 'A1',
    subjects: [
      { name: 'Mathematics', guName: 'ગણિત', max: 25, obtained: 24 },
      { name: 'Science & Tech', guName: 'વિજ્ઞાન', max: 25, obtained: 24 },
      { name: 'Social Science', guName: 'સામાજિક વિજ્ઞાન', max: 25, obtained: 23 },
      { name: 'Gujarati FL', guName: 'ગુજરાતી', max: 25, obtained: 24 },
      { name: 'English SL', guName: 'અંગ્રેજી', max: 25, obtained: 22 },
      { name: 'Computer Studies', guName: 'કમ્પ્યુટર', max: 25, obtained: 23 },
    ],
  },
  {
    testId: 'ek-4',
    testName: 'Ekam Kasoti 4 (November)',
    guTestName: 'એકમ કસોટી ૪ (નવેમ્બર)',
    date: '2026-11-26',
    maxMarks: 150,
    obtainedMarks: 142,
    percentage: 94.7,
    classAverage: 78.4,
    grade: 'A1',
    subjects: [
      { name: 'Mathematics', guName: 'ગણિત', max: 25, obtained: 24 },
      { name: 'Science & Tech', guName: 'વિજ્ઞાન', max: 25, obtained: 24 },
      { name: 'Social Science', guName: 'સામાજિક વિજ્ઞાન', max: 25, obtained: 23 },
      { name: 'Gujarati FL', guName: 'ગુજરાતી', max: 25, obtained: 25 },
      { name: 'English SL', guName: 'અંગ્રેજી', max: 25, obtained: 23 },
      { name: 'Computer Studies', guName: 'કમ્પ્યુટર', max: 25, obtained: 23 },
    ],
  },
  {
    testId: 'ek-5',
    testName: 'Ekam Kasoti 5 (January)',
    guTestName: 'એકમ કસોટી ૫ (જાન્યુઆરી)',
    date: '2027-01-22',
    maxMarks: 150,
    obtainedMarks: 146,
    percentage: 97.3,
    classAverage: 80.1,
    grade: 'A1',
    subjects: [
      { name: 'Mathematics', guName: 'ગણિત', max: 25, obtained: 25 },
      { name: 'Science & Tech', guName: 'વિજ્ઞાન', max: 25, obtained: 24 },
      { name: 'Social Science', guName: 'સામાજિક વિજ્ઞાન', max: 25, obtained: 24 },
      { name: 'Gujarati FL', guName: 'ગુજરાતી', max: 25, obtained: 25 },
      { name: 'English SL', guName: 'અંગ્રેજી', max: 25, obtained: 24 },
      { name: 'Computer Studies', guName: 'કમ્પ્યુટર', max: 25, obtained: 24 },
    ],
  },
];

export const EkamKasotiTrendChart: React.FC<EkamKasotiTrendChartProps> = ({
  studentName = 'Harsh Patel',
  className = 'Class 10th-A',
  compact = false,
  showSubjectFilter = true,
  customData,
}) => {
  const { language } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<EkamKasotiDataPoint | null>(null);

  const rawData = customData || DEFAULT_EKAM_KASOTI_HISTORY;

  // Transform data if a specific subject is selected
  const chartData = rawData.map((d) => {
    if (selectedSubject === 'ALL') {
      return {
        ...d,
        displayValue: d.percentage,
        label: `${d.obtainedMarks}/${d.maxMarks} (${d.percentage}%)`,
      };
    }
    const sub = d.subjects.find((s) => s.name === selectedSubject);
    const subPct = sub ? Math.round((sub.obtained / sub.max) * 100) : d.percentage;
    return {
      ...d,
      displayValue: subPct,
      label: sub ? `${sub.obtained}/${sub.max} (${subPct}%)` : `${d.percentage}%`,
      subObtained: sub?.obtained,
      subMax: sub?.max,
    };
  });

  const firstPct = chartData[0]?.displayValue || 0;
  const lastPct = chartData[chartData.length - 1]?.displayValue || 0;
  const growthRate = Math.round((lastPct - firstPct) * 10) / 10;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 550;
    const height = compact ? 220 : 280;
    const margin = {
      top: 30,
      right: 35,
      bottom: compact ? 35 : 45,
      left: compact ? 35 : 45,
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    // Definitions (Gradients, filters)
    const defs = svg.append('defs');

    // Area Gradient Fill
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'ekam-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.0);

    // Line Gradient Stroke
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'ekam-line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#059669');
    lineGradient.append('stop').attr('offset', '50%').attr('stop-color', '#10b981');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4');

    // Drop shadow filter for data points
    const filter = defs.append('filter').attr('id', 'point-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const testNames = chartData.map((d) => (language === 'gu' ? d.guTestName.replace(' (', '\n(') : d.testName.replace(' (', '\n(')));
    const xScale = d3.scalePoint<string>().domain(testNames).range([0, innerWidth]).padding(0.2);

    // Y Scale (fixed range 50% to 100% or min-10 to 100 for dramatic visual legibility)
    const minVal = Math.max(
      0,
      Math.floor((d3.min(chartData, (d: ChartDataPoint) => Math.min(d.displayValue, d.classAverage)) ?? 70) / 10) * 10 - 10
    );
    const yScale = d3.scaleLinear().domain([minVal, 100]).range([innerHeight, 0]).nice();

    // Horizontal Grid Lines
    const yTicks = yScale.ticks(compact ? 4 : 5);
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 3');

    // Target Benchmark Line (90% - GSEB A1 Grade Target)
    if (minVal <= 90) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(90))
        .attr('y2', yScale(90))
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4 4')
        .attr('opacity', 0.85);

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', yScale(90) - 5)
        .attr('text-anchor', 'end')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', '#d97706')
        .text(language === 'gu' ? 'A1 ગ્રેડ લક્ષ્યાંક (90%)' : 'A1 Benchmark (90%)');
    }

    // Class Average Trend Line (Dotted Gray/Indigo)
    const avgLineGen = d3
      .line<(typeof chartData)[0]>()
      .x((_, i) => xScale(testNames[i]) || 0)
      .y((d) => yScale(d.classAverage))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '4 4')
      .attr('d', avgLineGen);

    // Student Progress Area Generator
    const areaGen = d3
      .area<(typeof chartData)[0]>()
      .x((_, i) => xScale(testNames[i]) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.displayValue))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(chartData).attr('fill', 'url(#ekam-area-gradient)').attr('d', areaGen);

    // Student Trend Line Generator
    const lineGen = d3
      .line<(typeof chartData)[0]>()
      .x((_, i) => xScale(testNames[i]) || 0)
      .y((d) => yScale(d.displayValue))
      .curve(d3.curveMonotoneX);

    const path = g
      .append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#ekam-line-gradient)')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('d', lineGen);

    // Animate line draw
    const pathLength = (path.node() as SVGPathElement)?.getTotalLength() || 1000;
    path
      .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Data Points / Dots
    const pointsGroup = g.append('g').attr('class', 'data-points');

    chartData.forEach((d, i) => {
      const cx = xScale(testNames[i]) || 0;
      const cy = yScale(d.displayValue);

      // Outer glow circle
      pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 7)
        .attr('fill', '#10b981')
        .attr('fill-opacity', 0.2)
        .attr('class', 'cursor-pointer transition-all hover:scale-125');

      // Main point
      const circle = pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4.5)
        .attr('fill', '#ffffff')
        .attr('stroke', '#059669')
        .attr('stroke-width', 2.5)
        .attr('filter', 'url(#point-glow)')
        .attr('class', 'cursor-pointer transition-all hover:scale-125');

      // Value label on top of point
      g.append('text')
        .attr('x', cx)
        .attr('y', cy - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('fill', '#0f172a')
        .text(`${d.displayValue}%`);

      // Mouse interactive overlay
      circle
        .on('mouseenter', () => setHoveredPoint(d))
        .on('mouseleave', () => setHoveredPoint(null));
    });

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b');

    xAxisGroup.select('.domain').attr('stroke', '#cbd5e1');
    xAxisGroup
      .selectAll('text')
      .attr('font-size', compact ? '9px' : '10px')
      .attr('font-weight', '600')
      .attr('fill', '#334155');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(compact ? 4 : 5)
      .tickFormat((d) => `${d}%`)
      .tickSize(0)
      .tickPadding(8);

    const yAxisGroup = g.append('g').call(yAxis).attr('color', '#64748b');
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('text').attr('font-size', '10px').attr('font-mono', 'true').attr('fill', '#64748b');
  }, [chartData, compact, language, selectedSubject]);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs overflow-hidden"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
                <span>
                  {language === 'gu'
                    ? 'એકમ કસોટી શૈક્ષણિક પ્રગતિ વલણ (D3 Progress Trend)'
                    : 'Ekam Kasoti Academic Progress Trendline'}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                  D3.js
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'gu'
                  ? `ક્રમિક એકમ કસોટીઓમાં મેળવેલ ગુણ અને શૈક્ષણિક વૃદ્ધિ દર • ${studentName} (${className})`
                  : `Sequential Periodic Assessment Test trajectory & growth curve for ${studentName} (${className})`}
              </p>
            </div>
          </div>
        </div>

        {/* Growth Badge & Subject Filter */}
        <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap gap-y-2">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`} {language === 'gu' ? 'વૃદ્ધિ' : 'Growth'}
            </span>
          </div>

          {showSubjectFilter && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="ALL">
                {language === 'gu' ? 'તમામ વિષયો (કુલ ગુણ)' : 'All Subjects Aggregate'}
              </option>
              <option value="Mathematics">
                {language === 'gu' ? 'ગણિત (Mathematics)' : 'Mathematics (ગણિત)'}
              </option>
              <option value="Science & Tech">
                {language === 'gu' ? 'વિજ્ઞાન અને ટેકનોલોજી' : 'Science & Technology'}
              </option>
              <option value="Social Science">
                {language === 'gu' ? 'સામાજિક વિજ્ઞાન' : 'Social Science'}
              </option>
              <option value="Gujarati FL">
                {language === 'gu' ? 'ગુજરાતી પ્રથમ ભાષા' : 'Gujarati FL'}
              </option>
              <option value="English SL">
                {language === 'gu' ? 'અંગ્રેજી દ્વિતીય ભાષા' : 'English SL'}
              </option>
              <option value="Computer Studies">
                {language === 'gu' ? 'કમ્પ્યુટર અધ્યયન' : 'Computer Studies'}
              </option>
            </select>
          )}
        </div>
      </div>

      {/* D3 SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 pointer-events-none animate-in fade-in duration-150 z-20 max-w-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
              <span className="font-bold text-emerald-400 font-heading">
                {language === 'gu' ? hoveredPoint.guTestName : hoveredPoint.testName}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/30">
                Grade {hoveredPoint.grade}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'gu' ? 'મેળવેલ ગુણ:' : 'Marks Scored:'}</span>
                <span className="font-bold text-white">
                  {hoveredPoint.obtainedMarks} / {hoveredPoint.maxMarks} ({hoveredPoint.percentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'gu' ? 'વર્ગ સરેરાશ:' : 'Class Average:'}</span>
                <span className="text-slate-300">{hoveredPoint.classAverage}%</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span>{language === 'gu' ? 'તારીખ:' : 'Test Date:'}</span>
                <span>{hoveredPoint.date}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Analytical Insights */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-4 flex-wrap gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs" />
            <span className="font-medium text-slate-700">
              {studentName} {language === 'gu' ? '(પ્રગતિ વલણ)' : '(Trend Line)'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-slate-400 border-b border-dashed border-slate-400" />
            <span className="text-slate-500">{language === 'gu' ? 'વર્ગ સરેરાશ (Class Avg)' : 'Class Average'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-amber-500 border-b border-dashed border-amber-500" />
            <span className="text-amber-700 font-semibold">{language === 'gu' ? 'A1 બેંચમાર્ક (90%)' : 'A1 Target (90%)'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {language === 'gu'
              ? `લગાતાર ૫ એકમ કસોટીમાં ઉત્કૃષ્ટ શૈક્ષણિક પ્રગતિ`
              : `Consistently Outstanding GSEB PAT Track Record`}
          </span>
        </div>
      </div>
    </div>
  );
};
