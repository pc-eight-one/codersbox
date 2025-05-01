<template>
  <div class="py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- About Section -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold mb-6 pb-2 border-b border-gray-200">About Me</h2>
        <div class="prose max-w-none prose-lg text-gray-600">
          <p class="mb-4">I'm a software developer with over 11 years of experience building web applications and
            services. My journey began with a Computer Science degree, followed by roles at established enterprises and
            startups where I've worked on everything from e-commerce platforms to developer tools to large networking
            and banking applications.</p>

          <p class="mb-4">I specialize in Java/Kotlin ecosystems, with expertise in Spring Boot and modern
            frontend development. I'm passionate about creating clean, maintainable code and building intuitive user
            experiences.</p>

          <p class="mb-4">When I'm not coding, I'm writing technical articles, creating tutorials or spending time with my family or travelling.
            I believe in learning in public and sharing knowledge with the developer community.</p>

          <p>Through this site, I document my learning journey, share practical tutorials, and showcase the projects
            I've built. My goal is to help other developers level up their skills while creating a portfolio of my
            work.</p>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold mb-6 pb-2 border-b border-gray-200">Skills & Expertise</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Backend -->
          <skill-card/>

          <!-- Frontend -->
          <SkillCard/>

          <!-- DevOps & Tools -->
          <SkillCard/>
        </div>
      </section>

      <!-- Experience Section -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold mb-6 pb-2 border-b border-gray-200">Experience</h2>

        <div class="space-y-8">
          <!-- Job 1 -->
          <ExperienceCard />

          <!-- Job 2 -->
          <ExperienceCard />

          <!-- Job 3 -->
          <ExperienceCard />
        </div>
      </section>

      <!-- Education Section -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold mb-6 pb-2 border-b border-gray-200">Education</h2>

        <EducationCard class="mb-4" />
        <EducationCard />
      </section>

      <!-- Contact Section -->
      <section>
        <h2 class="text-3xl font-bold mb-6 pb-2 border-b border-gray-200">Get In Touch</h2>

        <div class="flex flex-col">
          <div class="flex-1">
            <p class="text-gray-600 mb-6 leading-relaxed">I'm always open to discussing new projects, opportunities, or
              partnerships. Whether you have a question or just want to say hi, feel free to reach out!</p>
          </div>

          <div class="w-full bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-xl font-bold mb-4">Send Me a Message</h3>
            <form>
              <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="name"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>

              <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>

              <div class="mb-4">
                <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" rows="4"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
              </div>

              <button type="submit"
                      class="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'about',
})
</script>