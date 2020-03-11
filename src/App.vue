<template>
  <v-app>
    <v-app-bar color="indigo darken-2"
               dense
               dark>
      <v-toolbar-title>{{$t('app_name')}}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-menu
              bottom
              left
      >
        <template v-slot:activator="{ on }">
          <v-btn
                  icon
                  v-on="on"
          >
            <v-icon>mdi-earth</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item-group
                  :mandatory=true
                  color="indigo">
            <v-list-item
                    @click="changeLocale(i)"
                    v-for="(item, i) in languages"
                    :key="i"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content id="app">
      <PatternEditor/>
    </v-content>
  </v-app>
</template>

<script>
  import PatternEditor from "@/components/PatternEditor";
  import i18n from '@/plugins/i18n';

  export default {
    name: 'app',
    components: {
      PatternEditor
    },
    data() {
      return {
        languages: [
          { language: 'de', title: 'Deutsch' },
          { language: 'en', title: 'English' }
        ],
      };
    },
    methods: {
      changeLocale(i) {
        i18n.locale = this.languages[i].language;

      }
    }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
