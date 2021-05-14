import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-datagraph',
  templateUrl: './datagraph.component.html',
  styleUrls: ['./datagraph.component.scss']
})
export class DatagraphComponent implements OnInit {

  @ViewChild('chart',{static: true}) private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  @Input() private type;
  private margin: any = { top: 20, bottom: 60, left: 40, right: 40};
  private margin2 = 80;
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;

  constructor() { }

  ngOnInit() {

      if(this.type == "bar"){
        this.createBarChart();
        if (this.data) {
          this.updateBarChart(); 
        }
      }
      
  }
  

  ngOnChanges() {
    if(this.type == "bar")
    {
      if (this.chart) {
        this.updateBarChart();
      }
    }


  }

  createBarChart() {
    let element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    let svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr("height", '100%')

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
      
      const barGroups = this.chart.selectAll()
      .data(this.data)
      .enter()
      .append('g')

  

    // define X & Y domains
    let xDomain = this.data.map(d => d.index);
    let yDomain = [0, (d3.max(this.data, d => d.value))];

    // create scales
    this.xScale = d3.scaleBand().padding(0.3).domain(xDomain).rangeRound([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

    // bar colors
   // this.colors = d3.scaleLinear().domain([0, this.data.length]).range(<any[]>['red', 'blue']);
    
    barGroups 
      .append('text')
      .attr('class', 'value')
      .attr('x', (a) => this.xScale(a.index) + this.xScale.bandwidth() / 2)
      .attr('y', (a) => this.yScale(a.value)-5)
      .attr('text-anchor', 'middle')
      .style("font-size", 9)
      .style("fill", "black")
      .text((a) => `${a.value}`)


    // x & y axis
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(d3.axisBottom(this.xScale))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", 9)
      .style("fill", "black")

      
    this.yAxis = svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale))
      .selectAll("text")
      .style("font-size", 9)
      .style("fill", "black")

      
  }

  updateBarChart() {
    // update scales & axis
    this.xScale.domain(this.data.map(d => d.index));
    this.yScale.domain([0,(d3.max(this.data, d => d.value))]);
    this.xAxis.transition().call(d3.axisBottom(this.xScale));
    this.yAxis.transition().call(d3.axisLeft(this.yScale));

    let update = this.chart.selectAll('.bar')
      .data(this.data);

    // remove exiting bars
    update.exit().remove();

    // update existing bars
    this.chart.selectAll('.bar').transition()
      .attr('x', d => this.xScale(d.index))
      .attr('y', d => this.yScale(d.value))
      .attr('width', d => this.xScale.bandwidth())
      .attr('height', d => this.height - this.yScale(d[1]))
      .style('fill', '#be7d27');

    // add new bars
    update
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.xScale(d.index))
      .attr('y', d => this.yScale(d.value))
      .attr('height', d => this.height - this.yScale(d.value))
      .attr('width', this.xScale.bandwidth())
      .style('fill', '#be7d27')
      .transition()
      .delay((d, i) => i * 10)

  }
}
