<template>
  <div>
    <!-- Main Content -->
    <main class="py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Recent Articles Section -->
        <section class="mb-16">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Recent Articles</h2>
            <a href="#" class="text-gray-600 hover:text-black transition-colors text-sm">View all articles →</a>
          </div>


          <ImageContainer
              :image-src="'test.svg'"
              :isVisible="isImageVisible"
              @close="isImageVisible = false"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ArticleCard/>
            <ArticleCard/>
            <ArticleCard/>
            <ArticleCard/>
            <ArticleCard/>
            <ArticleCard/>
          </div>
        </section>

        <!-- Recent Tutorials Section -->
        <section class="mb-16">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Recent Tutorials</h2>
            <a href="#" class="text-gray-600 hover:text-black transition-colors text-sm">View all tutorials →</a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TutorialCard/>
            <TutorialCard/>
            <TutorialCard/>
            <TutorialCard/>
          </div>
        </section>

        <!-- Recent Projects Section -->
        <section class="mb-16">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Recent Projects</h2>
            <a href="#" class="text-gray-600 hover:text-black transition-colors text-sm">View all projects →</a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
          </div>
        </section>

      </div>
    </main>

    <!-- About Section -->
    <section class="py-12 bg-gray-900 text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-2xl font-bold mb-2">About Me</h2>
            <p class="text-gray-400 mb-4 leading-relaxed">I'm a backend developer passionate about creating elegant
              solutions and sharing knowledge with the developer community.</p>
            <p class="text-gray-400 mb-6 leading-relaxed">I am currently working on web, mobile and desktop applications
              using Java, Kotlin and Vue. I love to write clean and functional code.</p>

            <div class="flex space-x-4 mt-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <i class="fab fa-github text-xl"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <i class="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <i class="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <i class="fas fa-envelope text-xl"></i>
              </a>
            </div>
          </div>

          <div class="hidden md:block">
            <div class="bg-gray-800 p-6 rounded-lg font-mono">
              <div class="text-sm">
                <span class="text-blue-400">const</span> <span class="text-yellow-400">developer</span> = {<br>
                &nbsp;&nbsp;name: <span class="text-green-400">"Prashant Chaturvedi"</span>,<br>
                &nbsp;&nbsp;role: <span class="text-green-400">"Full-Stack Developer"</span>,<br>
                &nbsp;&nbsp;loves: [<span class="text-green-400">"Java"</span>, <span
                  class="text-green-400">"Kotlin"</span>, <span
                  class="text-green-400">"Functional Programming"</span>]<br>
                };
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
definePageMeta({
  layout: 'home',
})

const isImageVisible = ref(false);
</script>