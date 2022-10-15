<template>
    <div class="dashboard-container">
        <div class="dashboard-text">username: {{name}}</div>
    </div>
</template>

<script>
// import { getTop10 } from "@/api/article";
import { mapState } from "vuex";

export default {
    name: "Dashboard",
    computed: {
        ...mapState("user", ["name"])
    },
    created() {
        // this.getTop10();
    },
    methods: {

    }
};
</script>

<style lang="scss" scoped>
.dashboard {
    &-container {
        margin: 30px;
    }
    &-text {
        font-size: 30px;
        line-height: 46px;
    }
}
</style>
