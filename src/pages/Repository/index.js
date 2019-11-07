/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import api from '../../services/api';
import Container from '../../components/Container/index';

import { IssueList, Loading, Owner, Select, Pages } from './styles';

class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    type: 'all',
    pageNumber: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleSelectChange = async e => {
    const typeSelected = e.target.value;

    const { repository } = this.state;

    const issues = await api.get(
      `/repos/${repository.owner.login}/${repository.name}/issues`,
      {
        params: {
          state: typeSelected,
          per_page: 5,
        },
      }
    );

    this.setState({
      type: typeSelected,
      issues: issues.data,
    });
  };

  handlePageClick = async action => {
    const { type, repository, pageNumber } = this.state;
    const newPage = action === 'back' ? pageNumber - 1 : pageNumber + 1;
    const issues = await api.get(
      `/repos/${repository.owner.login}/${repository.name}/issues`,
      {
        params: {
          state: type,
          per_page: 5,
          page: newPage,
        },
      }
    );

    this.setState({
      pageNumber: newPage,
      issues: issues.data,
    });
  };

  render() {
    const { repository, issues, loading, pageNumber } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Select>
          <span>Filtro: </span>
          <select name="issueType" onChange={this.handleSelectChange}>
            <option value="all">Todas</option>
            <option value="open">Abertas</option>
            <option value="closed">Fechadas</option>
          </select>
        </Select>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pages>
          {pageNumber !== 1 ? (
            <button type="button" onClick={() => this.handlePageClick('back')}>
              <FaChevronLeft /> Anterior
            </button>
          ) : (
            <div />
          )}
          <button type="button" onClick={() => this.handlePageClick('next')}>
            Próxima <FaChevronRight />
          </button>
        </Pages>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      respository: PropTypes.string,
    }),
  }).isRequired,
};

export default Repository;
