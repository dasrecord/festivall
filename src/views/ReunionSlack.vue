<template>
  <div class="reunion-slack">
    <h1>You've Been Invited To Join The Reunion Slack Team</h1>
    <p>
      The Reunion Slack team serves as a central hub for all communication and collaboration within
      our organization. It is designed to be a (S)earchable (L)og of all (C)ompany (K)nowledge,
      ensuring that important information is easily accessible to everyone.
    </p>
    <p>
      By joining this team, you will have access to various channels dedicated to different aspects
      of our operations, including project updates, team discussions, and general announcements.
      This helps in keeping everyone informed and aligned with the company's goals and activities.
    </p>
    <p>
      Slack also allows for real-time messaging, file sharing, and integration with other tools we
      use, making it an essential part of our workflow. Whether you need to ask a quick question,
      share a document, or collaborate on a project, Slack provides the platform to do so
      efficiently.
    </p>
    <p>
      We encourage all team members to actively participate in the Slack channels relevant to their
      roles and to use the platform to stay connected with colleagues. Your contributions help build
      a comprehensive and valuable knowledge base that benefits the entire organization.
    </p>
    <p>
      Please make sure to turn on notifications for important channels to stay updated with the
      latest information and announcements. This ensures that you don't miss out on any critical
      updates or discussions.
    </p>
    <a
      href="https://join.slack.com/t/reunionfestival/shared_invite/zt-2n9v17aud-yUWqZQBLj~zUlS9A4AngNA"
      target="_blank"
      class="join-link"
      >JOIN REUNION SLACK</a
    >
  </div>
</template>

<script>
export default {
  name: 'ReunionSlack'
}
</script>

<style scoped>
.reunion-slack {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reunion-slack h1 {
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.reunion-slack p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.join-link {
  display: inline-block;
  width: 100%;
  text-align: center;
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid var(--reunion-frog-green);
  color: var(--reunion-frog-green);
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.join-link:hover {
  background-color: var(--reunion-frog-green);
  color: #fff;
}
</style>
