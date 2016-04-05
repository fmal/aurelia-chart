import {inject, customElement, useView, bindable} from 'aurelia-framework'
import {ModelObserver} from "../observers/model-observer"
import {NumericConverter} from "../shared/numeric-converter"
import Chart from "chartjs"

@customElement('chart')
@inject(ModelObserver)
@useView("./chart-element.html")
export class ChartElement {
  @bindable type;
  @bindable data;
  @bindable shouldUpdate;
  @bindable throttle;
  @bindable nativeOptions;

  @bindable canvasElement;

  _activeChart;
  _canvasWidth;
  _canvasHeight;
  _modelObserver;
  _numericConverter;

  constructor(modelObserver) {
    this._modelObserver = modelObserver;
    this._numericConverter = new NumericConverter();
  }

  attached() {
    this._canvasWidth = this.canvasElement.width;
    this._canvasHeight = this.canvasElement.height;

    this.createChart();

    if(this.shouldUpdate)
    { this.subscribeToChanges(); }
  }

  createChart() {
    var context2d = this.canvasElement.getContext("2d");
    var sanitisedData = this._numericConverter.convertAllDataToNumeric(this.data); // doesnt like string based numerics
    this._activeChart = new Chart(context2d)[this.type](sanitisedData, this.nativeOptions);
  };

  refreshChart = () => {
    this._activeChart.destroy();
    this.createChart();

    // This stops the chart shrinking into oblivion
    this.canvasElement.width = this._canvasWidth;
    this.canvasElement.height = this._canvasHeight;
  };

  subscribeToChanges() {
    this._modelObserver.throttle = this.throttle || 100;
    this._modelObserver.observe(this.data, this.refreshChart);
  };
}