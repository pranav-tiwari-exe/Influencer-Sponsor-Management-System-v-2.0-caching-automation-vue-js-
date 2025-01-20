Chart.register(
    Chart.Title,
    Chart.Tooltip,
    Chart.Legend,
    Chart.BarElement,
    Chart.LinearScale
);

export default {
    props: {
      data: {
        type: Array, 
        required: true
      },
    },
    computed: {
      chartData() {
        const labels = this.data.map(item => `Campaign ${item.campaign_id}`);
        const data = this.data.map(item => item.transactions);
        return {
          labels,
          datasets: [
            {
              label: 'Monthly Transactions',
              backgroundColor: '#f87979',
              data
            }
          ]
        };
      },
      chartOptions() {
        return {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true 
            }
          }
        };
      }
    },
    mounted() {
      this.renderChart();
    },
    methods: {
      
      renderChart() {
        const ctx = this.$refs.myChart.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: this.chartData,
          options: this.chartOptions
        });
      }
    },
    template: `
      <div class="canvas" id="c1">
        <p class="canvas_head">Monthly Data Distribution:</p>
        <canvas ref="myChart" v-if="chartData.labels.length > 0"></canvas>
        <div v-else>
          <p class="form-text">No data available to display the chart.</p>
        </div>
      </div>
    `
  };
