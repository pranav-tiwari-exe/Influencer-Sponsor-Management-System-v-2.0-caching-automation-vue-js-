
Chart.register(
    Chart.Title,
    Chart.Tooltip,
    Chart.Legend,
    Chart.ArcElement
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
            const labels = this.data.map(item => Object.keys(item)[0]);
            const data = this.data.map(item => Object.values(item)[0]);
            return {
                labels,
                datasets: [
                    {
                        label: 'Ad Request Status',
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40'],
                        data
                    }
                ]
            };
        },
        chartOptions() {
            return {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Composition of Ad Requests Status'
                    }
                }
            };
        }
    },
    mounted() {
        console.log("component loaded")
        this.renderChart();
        
    },
    methods: {
        renderChart() {
            const ctx = this.$refs.myChart?.getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: this.chartData,
                options: this.chartOptions
            });
        }
    },
    template: `
        <div class="canvas" id="c2">
            <p class="canvas_head">Ad Request Status Composition:</p>
            <canvas ref="myChart" v-if="chartData.labels.length > 0"></canvas>
            <div v-else>
                <p class="form-text">No data available to display the chart.</p>
            </div>
        </div>
    `
};