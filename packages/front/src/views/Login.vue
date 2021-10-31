<template>
  <v-content>
    <v-container v-if="redirectUri">
      <a :href="redirectUri">자동으로 이동하지 않으면 이곳을 누르세요: {{redirectUri}}</a>
    </v-container>
    <v-container v-else fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-card-subtitle>
              {{clientName}} 에 로그인 합니다.
            </v-card-subtitle>
            <v-card-text>
              <v-form>
                <v-text-field
                  v-model="username"
                  prepend-icon="fas fa-user"
                  name="login"
                  label="Login"
                  type="text"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  prepend-icon="fas fa-lock"
                  name="password"
                  label="Password"
                  type="password"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-text v-if="errorMessage" style="color: red">
              {{errorMessage}}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" v-on:click="login">Login</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';

@Component({})
export default class Login extends Vue {
  public clientName: string = '';
  public username: string = 'test01';
  public password: string = 'password';

  public errorMessage: string = '';
  public redirectUri: string = '';

  public mounted () {
    this.getClientName()
      .then((text) => {
        this.clientName = text;
      });
  }

  public get targetName (): string {
    return this.$t(`application.${this.target}.name`);
  }

  public get target (): string {
    return this.$route.query.target as string;
  }

  public getClientName (): Promise<string> {
    return axios.get(
      '/api/oauth/client-name?client_id=' + this.$route.query.client_id
    )
      .then((response) => {
        return response.data;
      });
  }

  public login (): void {
    axios.post(
      '/api/oauth/authorize?response_mode=json',
      {
        response_type: this.$route.query.response_type,
        grant_type: 'password',
        username: this.username,
        password: this.password,
        state: this.$route.query.state,
        redirect_uri: this.$route.query.redirect_uri,
        client_id: this.$route.query.client_id,
        scope: this.$route.query.scope
      }
    )
      .then((response) => {
        this.errorMessage = '';
        console.log(response);
        if (response.data.redirect_uri) {
          this.redirectUri = response.data.redirect_uri;
          window.location.href = response.data.redirect_uri;
        }
      })
      .catch((err) => {
        console.error(err);
        console.error({ ...err });
        this.redirectUri = '';
        this.errorMessage = err?.response?.data?.message || err;
      });
  }
}
</script>
