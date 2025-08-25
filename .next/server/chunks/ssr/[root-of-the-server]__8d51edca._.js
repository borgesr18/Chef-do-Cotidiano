module.exports=[94131,(a,b,c)=>{b.exports=a.x("@supabase/supabase-js",()=>require("@supabase/supabase-js"))},29830,a=>{"use strict";a.s(["analytics",()=>l,"blogPosts",()=>j,"categories",()=>h,"courses",()=>i,"ebookPurchases",()=>o,"ebooks",()=>n,"recipes",()=>g,"settings",()=>m,"users",()=>k]);var b=a.i(94131);let c={get url(){return`file://${a.P("src/lib/supabase.js")}`}},d=c.env.VITE_SUPABASE_URL||"https://placeholder.supabase.co",e=c.env.VITE_SUPABASE_ANON_KEY||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTk1NjU3MTIwMH0.placeholder",f=(0,b.createClient)(d,e,{auth:{autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0},global:{headers:{Accept:"application/json",apikey:e}}}),g={getPublished:async(a=10,b=0)=>{let{data:c,error:d}=await f.from("recipes").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `).eq("status","published").order("created_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getBySlug:async a=>{let{data:b,error:c}=await f.from("recipes").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url,
          bio
        ),
        categories (
          name,
          slug
        ),
        recipe_ingredients (
          *,
          ingredients (
            name,
            unit
          )
        ),
        recipe_instructions (
          *
        )
      `).eq("slug",a).eq("status","published").maybeSingle();return{data:b,error:c}},getByCategory:async(a,b=10,c=0)=>{let{data:d,error:e}=await f.from("recipes").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories!inner (
          name,
          slug
        )
      `).eq("categories.slug",a).eq("status","published").order("created_at",{ascending:!1}).range(c,c+b-1);return{data:d,error:e}},search:async(a,b={})=>{let c=f.from("recipes").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories!inner (
          name,
          slug
        )
      `).eq("status","published");a&&(c=c.or(`title.ilike.%${a}%,description.ilike.%${a}%`)),b.category&&(c=c.eq("categories.slug",b.category)),b.difficulty&&(c=c.eq("difficulty",b.difficulty)),b.maxTime&&(c=c.lte("total_time",b.maxTime));let{data:d,error:e}=await c.order("created_at",{ascending:!1}).limit(20);return{data:d,error:e}},create:async a=>{let{data:b,error:c}=await f.from("recipes").insert([a]).select().single();return{data:b,error:c}},getById:async a=>{let{data:b,error:c}=await f.from("recipes").select(`
        *,
        profiles:author_id(full_name, avatar_url),
        categories(name, slug)
      `).eq("id",a).single();return{data:b,error:c}},update:async(a,b)=>{let{data:c,error:d}=await f.from("recipes").update(b).eq("id",a).select().single();return{data:c,error:d}},delete:async a=>{let{error:b}=await f.from("recipes").delete().eq("id",a);return{error:b}},getAllForAdmin:async(a=50,b=0)=>{try{let{data:c,error:d}=await f.from("recipes").select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          ),
          categories (
            name,
            slug
          )
        `).order("created_at",{ascending:!1}).range(b,b+a-1);if(d)throw d;return{data:c||[],error:null}}catch(a){return{data:[],error:a}}},getAll:async(a=50,b=0)=>g.getAllForAdmin(a,b)},h={getAll:async()=>{let{data:a,error:b}=await f.from("categories").select("*").eq("is_active",!0).order("sort_order",{ascending:!0});return{data:a,error:b}},getAllForAdmin:async()=>{try{let{data:a,error:b}=await f.from("categories").select("*").order("sort_order",{ascending:!0});if(b)throw b;return{data:a||[],error:null}}catch(a){return{data:[],error:a}}},getBySlug:async a=>{let{data:b,error:c}=await f.from("categories").select("*").eq("slug",a).eq("is_active",!0).single();return{data:b,error:c}},create:async a=>{let{data:b,error:c}=await f.from("categories").insert([a]).select().single();return{data:b,error:c}},update:async(a,b)=>{let{data:c,error:d}=await f.from("categories").update(b).eq("id",a).select().single();return{data:c,error:d}},delete:async a=>{let{error:b}=await f.from("categories").delete().eq("id",a);return{error:b}}},i={getAll:async(a=10,b=0)=>{let{data:c,error:d}=await f.from("courses").select(`
        *,
        profiles:instructor_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `).order("created_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getPublished:async(a=10,b=0)=>{let{data:c,error:d}=await f.from("courses").select(`
        *,
        profiles:instructor_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `).eq("status","published").order("created_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getBySlug:async a=>{let{data:b,error:c}=await f.from("courses").select(`
        *,
        profiles:instructor_id (
          full_name,
          avatar_url,
          bio
        ),
        categories (
          name,
          slug
        ),
        course_modules (
          *,
          course_lessons (
            *
          )
        )
      `).eq("slug",a).eq("status","published").single();return{data:b,error:c}},create:async a=>{let{data:b,error:c}=await f.from("courses").insert([a]).select().single();return{data:b,error:c}},getById:async a=>{let{data:b,error:c}=await f.from("courses").select(`
        *,
        profiles:instructor_id(full_name, avatar_url),
        categories(name, slug)
      `).eq("id",a).single();return{data:b,error:c}},update:async(a,b)=>{let{data:c,error:d}=await f.from("courses").update(b).eq("id",a).select().single();return{data:c,error:d}},delete:async a=>{let{error:b}=await f.from("courses").delete().eq("id",a);return{error:b}}},j={getAll:async(a=10,b=0)=>{let{data:c,error:d}=await f.from("blog_posts").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `).order("created_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getPublished:async(a=10,b=0)=>{let{data:c,error:d}=await f.from("blog_posts").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `).eq("status","published").order("published_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getBySlug:async a=>{let{data:b,error:c}=await f.from("blog_posts").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url,
          bio
        ),
        categories (
          name,
          slug
        )
      `).eq("slug",a).eq("status","published").single();return{data:b,error:c}},create:async a=>{let{data:b,error:c}=await f.from("blog_posts").insert([a]).select().single();return{data:b,error:c}},getById:async a=>{let{data:b,error:c}=await f.from("blog_posts").select(`
        *,
        profiles:author_id(full_name, avatar_url),
        categories(name, slug)
      `).eq("id",a).single();return{data:b,error:c}},update:async(a,b)=>{let{data:c,error:d}=await f.from("blog_posts").update(b).eq("id",a).select().single();return{data:c,error:d}},delete:async a=>{let{error:b}=await f.from("blog_posts").delete().eq("id",a);return{error:b}}},k={getAll:async(a=10,b=0)=>{let{data:c,error:d}=await f.from("profiles").select("*").order("created_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getById:async a=>{let{data:b,error:c}=await f.from("profiles").select("*").eq("id",a).single();return{data:b,error:c}},updateRole:async(a,b)=>{let{data:c,error:d}=await f.from("profiles").update({role:b}).eq("id",a).select().single();return{data:c,error:d}},updateProfile:async(a,b)=>{let{data:c,error:d}=await f.from("profiles").update(b).eq("id",a).select().single();return{data:c,error:d}}},l={getDashboardStats:async()=>{try{let[a,b,c,d]=await Promise.all([f.from("recipes").select("id",{count:"exact",head:!0}),f.from("profiles").select("id",{count:"exact",head:!0}),f.from("courses").select("id",{count:"exact",head:!0}),f.from("recipe_analytics").select("views")]),e=d.data?.reduce((a,b)=>a+(b.views||0),0)||0;return{data:{totalRecipes:a.count||0,totalUsers:b.count||0,totalCourses:c.count||0,totalViews:e},error:null}}catch(a){return{data:{totalRecipes:0,totalUsers:0,totalCourses:0,totalViews:0},error:null}}},recordRecipeView:async(a,b=null)=>{let{data:c,error:d}=await f.from("recipe_analytics").insert([{recipe_id:a,user_id:b,event_type:"view"}]);return{data:c,error:d}},recordRecipeLike:async(a,b)=>{let{data:c,error:d}=await f.from("recipe_analytics").insert([{recipe_id:a,user_id:b,event_type:"like"}]);return{data:c,error:d}},getPopularRecipes:async(a=10)=>{let{data:b,error:c}=await f.from("recipe_analytics").select(`
        recipe_id,
        recipes (
          title,
          slug,
          image_url
        )
      `).eq("event_type","view").order("created_at",{ascending:!1}).limit(a);return{data:b,error:c}}},m={getAll:async()=>{let{data:a,error:b}=await f.from("settings").select("*");return{data:a,error:b}},get:async a=>{let{data:b,error:c}=await f.from("settings").select("*").eq("key",a).single();return{data:b,error:c}},set:async(a,b,c="string")=>{let{data:d,error:e}=await f.from("settings").upsert([{key:a,value:b,type:c}]).select().single();return{data:d,error:e}},delete:async a=>{let{data:b,error:c}=await f.from("settings").delete().eq("key",a);return{data:b,error:c}}},n={getAll:async(a=20,b=0)=>{let{data:c,error:d}=await f.from("ebooks").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `).order("created_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getPublished:async(a=20,b=0)=>{let{data:c,error:d}=await f.from("ebooks").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `).eq("status","published").order("created_at",{ascending:!1}).range(b,b+a-1);return{data:c,error:d}},getBySlug:async a=>{let{data:b,error:c}=await f.from("ebooks").select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url,
          bio
        ),
        categories (
          name,
          slug
        )
      `).eq("slug",a).eq("status","published").maybeSingle();return{data:b,error:c}},getById:async a=>{let{data:b,error:c}=await f.from("ebooks").select(`
        *,
        profiles:author_id(full_name, avatar_url),
        categories(name, slug)
      `).eq("id",a).single();return{data:b,error:c}},create:async a=>{let{data:b,error:c}=await f.from("ebooks").insert([a]).select().single();return{data:b,error:c}},update:async(a,b)=>{let{data:c,error:d}=await f.from("ebooks").update(b).eq("id",a).select().single();return{data:c,error:d}},delete:async a=>{let{error:b}=await f.from("ebooks").delete().eq("id",a);return{error:b}}},o={purchase:async(a,{amount:b,method:c="stripe",transactionId:d=null}={})=>{let{data:{user:e}}=await f.auth.getUser();if(!e)return{data:null,error:"Usuário não autenticado"};let{data:g,error:h}=await f.from("ebook_purchases").insert([{ebook_id:a,user_id:e.id,amount:b||0,payment_method:c,transaction_id:d,status:"paid"}]).select().single();return{data:g,error:h}},getByUser:async()=>{let{data:{user:a}}=await f.auth.getUser();if(!a)return{data:[],error:"Usuário não autenticado"};let{data:b,error:c}=await f.from("ebook_purchases").select(`
        *,
        ebooks(title, slug, cover_image, price)
      `).eq("user_id",a.id).order("purchased_at",{ascending:!1});return{data:b,error:c}},hasPurchased:async a=>{let{data:{user:b}}=await f.auth.getUser();if(!b)return{data:!1,error:null};let{data:c,error:d}=await f.from("ebook_purchases").select("id").eq("ebook_id",a).eq("user_id",b.id).maybeSingle();return{data:!!c,error:d}}}},52585,a=>{"use strict";a.s(["supabase",()=>e]);var b=a.i(94131);a.i(29830);let c=process.env.NEXT_PUBLIC_SUPABASE_URL,d=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,e=(0,b.createClient)(c,d)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__8d51edca._.js.map