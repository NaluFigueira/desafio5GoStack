/* eslint-disable no-throw-literal */
import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container/index';

import { Form, SubmitButton, List, Input, Error } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    valid: true,
    errorMessage: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) this.setState({ repositories: JSON.parse(repositories) });
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories)
      localStorage.setItem('repositories', JSON.stringify(repositories));
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { newRepo, repositories } = this.state;

      const repoExists = repositories.find(repo => repo.name === newRepo);

      if (repoExists) throw 'Repositório duplicado!';

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        errorMessage: '',
        valid: true,
      });
    } catch (error) {
      let message = '';
      if (error !== 'Repositório duplicado!')
        message = 'Repositório inexistente!';
      else message = error;

      this.setState({ valid: false, newRepo: '', errorMessage: message });
    }

    this.setState({ loading: false });
  };

  render() {
    const { newRepo, loading, repositories, valid, errorMessage } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <Input
            type="text"
            placeholder="Adicionar repositório"
            valid={!!valid}
            value={newRepo}
            onChange={this.handleInputChange}
          />
          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="FFF" size={14} />
            ) : (
              <FaPlus color="FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        {valid ? <></> : <Error>{errorMessage}</Error>}
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
